import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const cancelBookingProcedure = protectedProcedure
  .input(z.object({
    bookingId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { data: booking, error: lookupError } = await ctx.supabase
      .from('bookings')
      .select('id, profile_id')
      .eq('id', input.bookingId)
      .single();

    if (lookupError || !booking) {
      throw new Error('Booking not found');
    }

    const canManage = ctx.profile?.role === 'admin' || ctx.profile?.id === booking.profile_id;
    if (!canManage) {
      throw new Error('You can only cancel your own bookings');
    }

    const { error } = await ctx.supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', input.bookingId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
