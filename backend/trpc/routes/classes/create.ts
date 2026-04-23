import { z } from "zod";
import { protectedProcedure } from "../../middleware/auth";

export const createClassProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      ageGroup: z.string(),
      level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      day: z.string(),
      time: z.string(),
      duration: z.string(),
      coachId: z.string(),
      capacity: z.number(),
      enrolled: z.number(),
      description: z.string(),
      dayOfWeek: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { data, error } = await ctx.supabase
      .from("classes")
      .insert({
        name: input.name,
        age_group: input.ageGroup,
        level: input.level,
        day: input.day,
        time: input.time,
        duration: input.duration,
        coach_id: input.coachId,
        capacity: input.capacity,
        enrolled: input.enrolled,
        description: input.description,
        day_of_week: input.dayOfWeek,
      })
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
