import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { Database } from '../../../../lib/database.types';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export const bookClassProcedure = protectedProcedure
  .input(z.object({
    classId: z.string(),
    studentId: z.string(),
    classDate: z.string(),
    isWaitlist: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const bookingsEnabled = process.env.ENABLE_BOOKINGS === 'true';
    const [profileId, childId] = input.studentId.split('-');
    if (!profileId || !childId) {
      throw new Error('Invalid studentId format. Expected format: profileId-childId');
    }
    if (ctx.profile?.role !== 'admin' && ctx.profile?.id !== profileId) {
      throw new Error('You can only create bookings for your own children');
    }

    if (!bookingsEnabled) {
      return {
        success: true,
        booking: {
          id: `mock-${Date.now()}`,
          profile_id: profileId,
          class_id: input.classId,
          child_id: childId,
          booking_date: input.classDate,
          status: 'confirmed' as const,
          attended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    const { data: childExists } = await ctx.supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('profile_id', profileId)
      .single();
    if (!childExists) throw new Error('Child not found for this profile');

    const bookingToInsert: BookingInsert = {
      profile_id: profileId,
      class_id: input.classId,
      child_id: childId,
      booking_date: input.classDate,
      status: input.isWaitlist ? 'waitlist' : 'confirmed',
    };

    const { data, error } = await ctx.supabase.from('bookings').insert(bookingToInsert).select().single();
    if (error || !data) throw new Error(error?.message || 'Failed to create booking');
    return { success: true, booking: data };
  });
