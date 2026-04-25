import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface Booking {
  id: string;
  classId: string;
  studentId: string;
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
  const [studentIdFilter, setStudentIdFilter] = useState<string | null>(null);
  
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = trpc.bookings.getAll.useQuery();
  const { data: privateSessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = trpc.sessions.getAll.useQuery();
  
  const bookClassMutation = trpc.bookings.book.useMutation({
    onSuccess: () => {
      refetchBookings();
    },
  });
  
  const bookMultipleMutation = trpc.bookings.bookMultiple.useMutation({
    onSuccess: () => {
      refetchBookings();
    },
  });
  
  const cancelBookingMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      refetchBookings();
    },
  });
  
  const bookSessionMutation = trpc.sessions.book.useMutation({
    onSuccess: () => {
      refetchSessions();
    },
  });

  const bookClass = useCallback(async (classId: string, studentId: string, classDate: string, isWaitlist: boolean = false) => {
    try {
      const result = await bookClassMutation.mutateAsync({
        classId,
        studentId,
        classDate,
        isWaitlist,
      });
      return result;
    } catch (error) {
      console.error('Failed to book class:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Booking failed' };
    }
  }, [bookClassMutation]);

  const bookMultipleDates = useCallback(async (classId: string, studentId: string, dates: string[]) => {
    try {
      const result = await bookMultipleMutation.mutateAsync({
        classId,
        studentId,
        dates,
      });
      return { ...result, error: undefined };
    } catch (error) {
      console.error('Failed to book multiple dates:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Booking failed' };
    }
  }, [bookMultipleMutation]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      const result = await cancelBookingMutation.mutateAsync({ bookingId });
      return result;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Cancellation failed' };
    }
  }, [cancelBookingMutation]);

  const bookPrivateSession = useCallback(async (
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
      return result;
    } catch (error) {
      console.error('Failed to book private session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Session booking failed' };
    }
  }, [bookSessionMutation]);

  const getStudentBookings = useCallback((studentId: string) => {
    return bookings.filter(b => b.studentId === studentId && b.status !== 'cancelled');
  }, [bookings]);

  const getStudentSessions = useCallback((studentId: string) => {
    return privateSessions.filter(s => s.studentId === studentId && s.status !== 'cancelled');
  }, [privateSessions]);

  const setStudentFilter = useCallback((studentId: string | null) => {
    setStudentIdFilter(studentId);
  }, []);

  const getClassBookings = useCallback((classId: string, classDate?: string) => {
    return bookings.filter(b => {
      const matchesClass = b.classId === classId && b.status !== 'cancelled';
      if (classDate) {
        return matchesClass && b.classDate === classDate;
      }
      return matchesClass;
    });
  }, [bookings]);

  return useMemo(() => ({
    bookings,
    privateSessions,
    isLoading: bookingsLoading || sessionsLoading,
    bookClass,
    bookMultipleDates,
    cancelBooking,
    bookPrivateSession,
    getStudentBookings,
    getStudentSessions,
    getClassBookings,
    setStudentFilter,
    studentIdFilter,
  }), [bookings, privateSessions, bookingsLoading, sessionsLoading, bookClass, bookMultipleDates, cancelBooking, bookPrivateSession, getStudentBookings, getStudentSessions, getClassBookings, setStudentFilter, studentIdFilter]);
});
