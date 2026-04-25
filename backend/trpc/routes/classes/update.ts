import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const updateClassProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    ageGroup: z.string().min(1).optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    day: z.string().min(1).optional(),
    time: z.string().min(1).optional(),
    duration: z.string().min(1).optional(),
    coachId: z.string().min(1).optional(),
    capacity: z.number().int().min(1).optional(),
    enrolled: z.number().int().min(0).optional(),
    description: z.string().min(1).optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.ageGroup !== undefined) updateData.age_group = input.ageGroup;
    if (input.level !== undefined) updateData.level = input.level;
    if (input.day !== undefined) updateData.day = input.day;
    if (input.time !== undefined) updateData.time = input.time;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.coachId !== undefined) updateData.coach_id = input.coachId;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.enrolled !== undefined) updateData.enrolled = input.enrolled;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.dayOfWeek !== undefined) updateData.day_of_week = input.dayOfWeek;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await ctx.supabase.from('classes').update(updateData).eq('id', input.id).select().single();
    if (error) throw new Error(error.message);
    return data;
  });
