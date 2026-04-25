import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { Database } from '../../../../lib/database.types';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export const bookMultipleDatesProcedure = protectedProcedure
  .input(
    z.object({
      classId: z.string(),
      studentId: z.string(),
      dates: z.array(z.string()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const [profileId, childId] = input.studentId.split('::');

    if (!profileId || !childId) {
      throw new Error('Invalid studentId format. Expected format: profileId::childId');
    }

    if (ctx.profile?.role !== 'admin' && ctx.profile?.id !== profileId) {
      throw new Error('You can only create bookings for your own children');
    }

    const bookingsToInsert: BookingInsert[] = input.dates.map((date) => ({
      profile_id: profileId,
      class_id: input.classId,
      child_id: childId,
      booking_date: date,
      status: 'confirmed',
    }));

    const { data, error } = await ctx.supabase
      .from('bookings')
      .insert(bookingsToInsert)
      .select();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create bookings');
    }

    return {
      success: true,
      bookings: data,
    };
  });
