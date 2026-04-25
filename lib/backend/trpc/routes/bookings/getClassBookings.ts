import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';
import { Database } from '../../../../lib/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export const getClassBookingsProcedure = protectedProcedure
  .input(z.object({
    classId: z.string(),
    classDate: z.string().optional(),
  }))
  .query(async ({ input, ctx }) => {
    requireAdmin(ctx);

    let query = ctx.supabase
      .from('bookings')
      .select('*')
      .eq('class_id', input.classId)
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: false });

    if (input.classDate) {
      query = query.eq('booking_date', input.classDate);
    }

    const { data: bookingsData, error } = await query;
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
