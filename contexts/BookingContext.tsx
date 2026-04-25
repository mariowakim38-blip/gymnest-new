import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
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
  coachId: string;
  studentId: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const [BookingProvider, useBooking] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const [studentIdFilter, setStudentIdFilter] = useState<string | null>(null);

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

  const {
    data: privateSessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = trpc.sessions.getAll.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

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

  const bookSessionMutation = trpc.sessions.book.useMutation({
    onSuccess: async () => {
      await refetchSessions();
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

  const bookPrivateSession = useCallback(
    async (
      coachId: string,
      studentId: string,
      date: string,
      time: string,
      duration: string
    ) => {
      try {
        const result = await bookSessionMutation.mutateAsync({
          coachId,
          studentId,
          date,
          time,
          duration,
        });

        await refetchSessions();

        return result;
      } catch (error) {
        console.error('Failed to book private session:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Session booking failed',
        };
      }
    },
    [bookSessionMutation, refetchSessions]
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
          session.studentId === studentId && session.status !== 'cancelled'
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
      isLoading: adminBookingsLoading || studentBookingsLoading || sessionsLoading,
      bookClass,
      bookMultipleDates,
      cancelBooking,
      bookPrivateSession,
      getStudentBookings,
      getStudentSessions,
      getClassBookings,
      setStudentFilter,
      studentIdFilter,
      refetchBookings,
    }),
    [
      bookings,
      privateSessions,
      adminBookingsLoading,
      studentBookingsLoading,
      sessionsLoading,
      bookClass,
      bookMultipleDates,
      cancelBooking,
      bookPrivateSession,
      getStudentBookings,
      getStudentSessions,
      getClassBookings,
      setStudentFilter,
      studentIdFilter,
      refetchBookings,
    ]
  );
});
