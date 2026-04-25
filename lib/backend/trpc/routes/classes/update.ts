import { z } from "zod";
import { protectedProcedure } from "../../middleware/auth";

export const updateClassProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      ageGroup: z.string().optional(),
      level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
      day: z.string().optional(),
      time: z.string().optional(),
      duration: z.string().optional(),
      coachId: z.string().optional(),
      capacity: z.number().optional(),
      enrolled: z.number().optional(),
      description: z.string().optional(),
      dayOfWeek: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

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

    const { data, error } = await ctx.supabase
      .from("classes")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      ageGroup: data.age_group,
      level: data.level,
      day: data.day,
      time: data.time,
      duration: data.duration,
      coachId: data.coach_id,
      capacity: data.capacity,
      enrolled: data.enrolled,
      description: data.description,
      dayOfWeek: data.day_of_week,
    };
  });
