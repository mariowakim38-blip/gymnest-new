import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const getAllBookingsProcedure = protectedProcedure.query(async ({ ctx }) => {
  requireAdmin(ctx);

  const { data, error } = await ctx.supabase
    .from('bookings')
    .select(`
      *,
      profiles:profile_id (
        id,
        name,
        phone_number
      ),
      children:child_id (
        id,
        name,
        age
      )
    `)
    .order('booking_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((booking: any) => ({
    ...booking,
    parentName: booking.profiles?.name || 'Unknown Parent',
    parentPhone: booking.profiles?.phone_number || '',
    childName: booking.children?.name || 'Unknown Child',
    childAge: booking.children?.age || '',
  }));
});
