import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const createClassProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    ageGroup: z.string().min(1),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    day: z.string().min(1),
    time: z.string().min(1),
    duration: z.string().min(1),
    coachId: z.string().min(1),
    capacity: z.number().int().min(1),
    enrolled: z.number().int().min(0).optional(),
    description: z.string().min(1),
    dayOfWeek: z.number().int().min(0).max(6),
  }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);

    const { data, error } = await ctx.supabase.from('classes').insert({
      name: input.name,
      age_group: input.ageGroup,
      level: input.level,
      day: input.day,
      time: input.time,
      duration: input.duration,
      coach_id: input.coachId,
      capacity: input.capacity,
      enrolled: input.enrolled ?? 0,
      description: input.description,
      day_of_week: input.dayOfWeek,
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
  });
