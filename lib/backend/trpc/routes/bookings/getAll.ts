import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';
import { Database } from '../../../../lib/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export const getAllBookingsProcedure = protectedProcedure.query(async ({ ctx }) => {
  requireAdmin(ctx);

  const { data: bookingsData, error } = await ctx.supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedBookings = (bookingsData ?? []) as BookingRow[];

  return typedBookings.map((booking) => ({
    id: booking.id,
    classId: booking.class_id || '',
    studentId: `${booking.profile_id}-${booking.child_id}`,
    bookingDate: booking.created_at || new Date().toISOString(),
    classDate: booking.booking_date || new Date().toISOString(),
    status: (booking.status === 'cancelled' ? 'cancelled' : 'confirmed') as 'confirmed' | 'waitlist' | 'cancelled',
    attended: booking.attended === true ? true : booking.attended === false ? false : undefined,
    attendanceMarkedAt: booking.attended !== null && booking.attended !== undefined ? booking.updated_at : undefined,
  }));
});
