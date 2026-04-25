import { z } from "zod";
import { protectedProcedure } from "../../middleware/auth";

export const createEventProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      date: z.string(),
      time: z.string(),
      type: z.enum(['Competition', 'Workshop', 'Showcase', 'Camp']),
      description: z.string(),
      location: z.string(),
      imageUrl: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { data, error } = await ctx.supabase
      .from("events")
      .insert({
        title: input.title,
        date: input.date,
        time: input.time,
        type: input.type,
        description: input.description,
        location: input.location,
        image_url: input.imageUrl,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time,
      type: data.type,
      description: data.description,
      location: data.location,
      imageUrl: data.image_url,
    };
  });
