import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { Database } from '../../../../lib/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export const getStudentBookingsProcedure = protectedProcedure
  .input(z.object({
    studentId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const [profileId, childId] = input.studentId.split('-');
    if (!profileId || !childId) return [];

    const canView = ctx.profile?.role === 'admin' || ctx.profile?.id === profileId;
    if (!canView) {
      throw new Error('You can only view your own bookings');
    }

    const { data: bookingsData, error } = await ctx.supabase
      .from('bookings')
      .select('*')
      .eq('profile_id', profileId)
      .eq('child_id', childId)
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: false });

    if (error) throw new Error(error.message);

    const typedBookings = (bookingsData ?? []) as BookingRow[];
    return typedBookings.map((booking) => ({
      id: booking.id,
      classId: booking.class_id,
      studentId: `${booking.profile_id}-${booking.child_id}`,
      bookingDate: booking.created_at,
      classDate: booking.booking_date,
      status: (booking.status === 'cancelled' ? 'cancelled' : 'confirmed') as 'confirmed' | 'waitlist' | 'cancelled',
      attended: booking.attended === true ? true : booking.attended === false ? false : undefined,
      attendanceMarkedAt: booking.attended !== null && booking.attended !== undefined ? booking.updated_at : undefined,
    }));
  });
