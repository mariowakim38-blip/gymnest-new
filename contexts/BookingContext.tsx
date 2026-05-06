import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  id: string;
  classId: string;
  studentId: string;
  profileId?: string;
  childId?: string;
  parentName?: string;
  parentPhone?: string;
  childName?: string;
  childAge?: number | string;
  className?: string;
  classAgeGroup?: string;
  classSchedule?: string;
  bookingDate: string;
  classDate: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  attended?: boolean;
  attendanceMarkedAt?: string;
}

export interface PrivateSession {
  id: string;
  privateBookingId: string;
  profileId: string;
  childId: string;
  parentName?: string;
  childName?: string;
  packageHours?: number;
  sessionDurationHours?: number;
  startDate?: string;
  selectedWeekday?: string | number;
  description?: string;
  sessionDate: string;
  attended: boolean | null;
  attendanceMarkedAt?: string | null;
  note?: string | null;
}

type CreatePrivateBookingResult = {
  success: boolean;
  error?: string;
  bookingId?: string;
  sessions?: PrivateSession[];
};

const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeWeekdayNumber = (weekday: number | string) => {
  if (typeof weekday === 'number') return weekday;

  const key = String(weekday).trim().toLowerCase();
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return dayMap[key] ?? Number(key);
};

export const [BookingProvider, useBooking] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const [studentIdFilter, setStudentIdFilter] = useState<string | null>(null);
  const [privateSessions, setPrivateSessions] = useState<PrivateSession[]>([]);
  const [privateSessionsLoading, setPrivateSessionsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const {
    data: adminBookings = [],
    isLoading: adminBookingsLoading,
    refetch: refetchAdminBookings,
  } = trpc.bookings.getAll.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

  const firstStudentId =
    user?.children && user.children.length > 0
      ? `${user.id}-${user.children[0].id}`
      : '';

  const {
    data: studentBookings = [],
    isLoading: studentBookingsLoading,
    refetch: refetchStudentBookings,
  } = trpc.bookings.getStudentBookings.useQuery(
    { studentId: firstStudentId },
    {
      enabled: isAuthenticated && !isAdmin && !!firstStudentId,
      retry: false,
    }
  );

  const bookings: Booking[] = useMemo(() => {
    return isAdmin ? (adminBookings as Booking[]) : (studentBookings as Booking[]);
  }, [isAdmin, adminBookings, studentBookings]);

  const refetchBookings = useCallback(async () => {
    if (isAdmin) {
      await refetchAdminBookings();
    } else {
      await refetchStudentBookings();
    }
  }, [isAdmin, refetchAdminBookings, refetchStudentBookings]);

  const refetchPrivateSessions = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPrivateSessions([]);
      return;
    }

    setPrivateSessionsLoading(true);

    try {
      let bookingsQuery = supabase
        .from('private_bookings')
        .select('*')
        .order('start_date', { ascending: true });

      if (!isAdmin) {
        bookingsQuery = bookingsQuery.eq('profile_id', user.id);
      }

      const { data: privateBookings, error: privateBookingsError } = await bookingsQuery;

      if (privateBookingsError) throw privateBookingsError;

      const bookingIds = (privateBookings || []).map((booking: any) => booking.id);

      if (bookingIds.length === 0) {
        setPrivateSessions([]);
        return;
      }

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('private_booking_sessions')
        .select('*')
        .in('private_booking_id', bookingIds)
        .order('session_date', { ascending: true });

      if (sessionsError) throw sessionsError;

      const profileIds = Array.from(
        new Set((privateBookings || []).map((booking: any) => booking.profile_id).filter(Boolean))
      );
      const childIds = Array.from(
        new Set((privateBookings || []).map((booking: any) => booking.child_id).filter(Boolean))
      );

      const { data: profilesData } = profileIds.length
        ? await supabase.from('profiles').select('id, name').in('id', profileIds)
        : { data: [] as any[] };

      const { data: childrenData } = childIds.length
        ? await supabase.from('children').select('id, name').in('id', childIds)
        : { data: [] as any[] };

      const profileById = new Map((profilesData || []).map((profile: any) => [profile.id, profile]));
      const childById = new Map((childrenData || []).map((child: any) => [child.id, child]));
      const bookingById = new Map((privateBookings || []).map((booking: any) => [booking.id, booking]));

      const mappedSessions: PrivateSession[] = (sessionsData || []).map((session: any) => {
        const privateBooking: any = bookingById.get(session.private_booking_id) || {};
        const profile: any = profileById.get(privateBooking.profile_id) || {};
        const child: any = childById.get(privateBooking.child_id) || {};

        return {
          id: session.id,
          privateBookingId: session.private_booking_id,
          profileId: privateBooking.profile_id,
          childId: privateBooking.child_id,
          parentName: profile.name || '',
          childName: child.name || '',
          packageHours: Number(privateBooking.package_hours) || undefined,
          sessionDurationHours: Number(privateBooking.session_duration_hours) || undefined,
          startDate: privateBooking.start_date,
          selectedWeekday: privateBooking.selected_weekday,
          description: privateBooking.description || '',
          sessionDate: session.session_date,
          attended: session.attended ?? null,
          attendanceMarkedAt: session.attendance_marked_at || null,
          note: session.note || null,
        };
      });

      setPrivateSessions(mappedSessions);
    } catch (error) {
      console.error('Failed to load private sessions:', error);
      setPrivateSessions([]);
    } finally {
      setPrivateSessionsLoading(false);
    }
  }, [isAuthenticated, isAdmin, user?.id]);

  useEffect(() => {
    refetchPrivateSessions();
  }, [refetchPrivateSessions]);

  const bookClassMutation = trpc.bookings.book.useMutation({
    onSuccess: async () => {
      await refetchBookings();
    },
  });

  const bookMultipleMutation = trpc.bookings.bookMultiple.useMutation({
    onSuccess: async () => {
      await refetchBookings();
    },
  });

  const cancelBookingMutation = trpc.bookings.cancel.useMutation({
    onSuccess: async () => {
      await refetchBookings();
    },
  });

  const bookClass = useCallback(
    async (
      classId: string,
      studentId: string,
      classDate: string,
      isWaitlist: boolean = false
    ) => {
      try {
        const result = await bookClassMutation.mutateAsync({
          classId,
          studentId,
          classDate,
          isWaitlist,
        });

        await refetchBookings();

        return result;
      } catch (error) {
        console.error('Failed to book class:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Booking failed',
        };
      }
    },
    [bookClassMutation, refetchBookings]
  );

  const bookMultipleDates = useCallback(
    async (classId: string, studentId: string, dates: string[]) => {
      try {
        console.log('BOOK MULTIPLE START', {
          classId,
          studentId,
          dates,
        });

        const result = await bookMultipleMutation.mutateAsync({
          classId,
          studentId,
          dates,
        });

        await refetchBookings();

        console.log('BOOK MULTIPLE SUCCESS', result);

        return {
          ...result,
          error: undefined,
        };
      } catch (error) {
        console.error('Failed to book multiple dates:', error);

        return {
          success: false,
          bookings: [],
          error: error instanceof Error ? error.message : 'Booking failed',
        };
      }
    },
    [bookMultipleMutation, refetchBookings]
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        const result = await cancelBookingMutation.mutateAsync({ bookingId });

        await refetchBookings();

        return result;
      } catch (error) {
        console.error('Failed to cancel booking:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Cancellation failed',
        };
      }
    },
    [cancelBookingMutation, refetchBookings]
  );

  const createPrivateBooking = useCallback(
    async (
      profileId: string,
      childId: string,
      packageHours: number,
      sessionDurationHours: number,
      weekday: number | string,
      startDate: string,
      description: string = ''
    ): Promise<CreatePrivateBookingResult> => {
      try {
        const cleanPackageHours = Number(packageHours);
        const cleanSessionDurationHours = Number(sessionDurationHours);
        const selectedWeekdayNumber = normalizeWeekdayNumber(weekday);

        if (!profileId || !childId) {
          return { success: false, error: 'Select a child before booking private sessions.' };
        }

        if (![4, 8, 16].includes(cleanPackageHours)) {
          return { success: false, error: 'Package must be 4, 8, or 16 hours.' };
        }

        if (!cleanSessionDurationHours || cleanSessionDurationHours <= 0) {
          return { success: false, error: 'Session duration is required.' };
        }

        if (cleanPackageHours % cleanSessionDurationHours !== 0) {
          return { success: false, error: 'Package hours must divide evenly by session duration.' };
        }

        if (!Number.isFinite(selectedWeekdayNumber) || selectedWeekdayNumber < 0 || selectedWeekdayNumber > 6) {
          return { success: false, error: 'Select a valid weekday.' };
        }

        if (!startDate) {
          return { success: false, error: 'Start date is required.' };
        }

        const { data: privateBooking, error: bookingError } = await supabase
          .from('private_bookings')
          .insert({
            profile_id: profileId,
            child_id: childId,
            title: 'Private Session',
            description: description.trim() || null,
            package_hours: cleanPackageHours,
            session_duration_hours: cleanSessionDurationHours,
            start_date: startDate,
            selected_weekday: String(weekday),
            status: 'active',
          })
          .select()
          .single();

        if (bookingError) throw bookingError;

        const sessionsCount = Math.floor(   cleanPackageHours / cleanSessionDurationHours );
        const dates: Date[] = [];
        const current = new Date(`${startDate}T12:00:00`);

        while (dates.length < sessionsCount) {
          if (current.getDay() === selectedWeekdayNumber) {
            dates.push(new Date(current));
          }

          current.setDate(current.getDate() + 1);
        }

        const { data: insertedSessions, error: sessionsError } = await supabase
          .from('private_booking_sessions')
          .insert(
            dates.map((date) => ({
              private_booking_id: privateBooking.id,
              session_date: formatDateOnly(date),
              attended: null,
              note: null,
            }))
          )
          .select();

        if (sessionsError) throw sessionsError;

        await refetchPrivateSessions();

        return {
          success: true,
          bookingId: privateBooking.id,
          sessions: (insertedSessions || []).map((session: any) => ({
            id: session.id,
            privateBookingId: session.private_booking_id,
            profileId,
            childId,
            packageHours: cleanPackageHours,
            sessionDurationHours: cleanSessionDurationHours,
            startDate,
            selectedWeekday: weekday,
            description,
            sessionDate: session.session_date,
            attended: session.attended ?? null,
            attendanceMarkedAt: session.attendance_marked_at || null,
            note: session.note || null,
          })),
        };
      } catch (error) {
        console.error('Failed to create private booking:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create private booking',
        };
      }
    },
    [refetchPrivateSessions]
  );

  const markPrivateAttendance = useCallback(
    async (sessionId: string, attended: boolean, note?: string) => {
      try {
        const { error } = await supabase
          .from('private_booking_sessions')
          .update({
            attended,
            attendance_marked_at: new Date().toISOString(),
            note: note?.trim() || null,
          })
          .eq('id', sessionId);

        if (error) throw error;

        await refetchPrivateSessions();

        return { success: true };
      } catch (error) {
        console.error('Failed to mark private attendance:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to mark private attendance',
        };
      }
    },
    [refetchPrivateSessions]
  );

  const getStudentBookings = useCallback(
    (studentId: string) => {
      return bookings.filter(
        (booking) =>
          booking.studentId === studentId && booking.status !== 'cancelled'
      );
    },
    [bookings]
  );

  const getStudentSessions = useCallback(
    (studentId: string) => {
      return privateSessions.filter(
        (session) =>
          (session.childId === studentId || `${session.profileId}-${session.childId}` === studentId) &&
          session.attended !== false
      );
    },
    [privateSessions]
  );

  const getClassBookings = useCallback(
    (classId: string, classDate?: string) => {
      return bookings.filter((booking) => {
        const matchesClass =
          booking.classId === classId && booking.status !== 'cancelled';

        if (classDate) {
          return matchesClass && booking.classDate === classDate;
        }

        return matchesClass;
      });
    },
    [bookings]
  );

  const setStudentFilter = useCallback((studentId: string | null) => {
    setStudentIdFilter(studentId);
  }, []);

  return useMemo(
    () => ({
      bookings,
      privateSessions,
      isLoading: adminBookingsLoading || studentBookingsLoading || privateSessionsLoading,
      bookClass,
      bookMultipleDates,
      cancelBooking,
      createPrivateBooking,
      markPrivateAttendance,
      getStudentBookings,
      getStudentSessions,
      getClassBookings,
      setStudentFilter,
      studentIdFilter,
      refetchBookings,
      refetchPrivateSessions,
    }),
    [
      bookings,
      privateSessions,
      adminBookingsLoading,
      studentBookingsLoading,
      privateSessionsLoading,
      bookClass,
      bookMultipleDates,
      cancelBooking,
      createPrivateBooking,
      markPrivateAttendance,
      getStudentBookings,
      getStudentSessions,
      getClassBookings,
      setStudentFilter,
      studentIdFilter,
      refetchBookings,
      refetchPrivateSessions,
    ]
  );
});
