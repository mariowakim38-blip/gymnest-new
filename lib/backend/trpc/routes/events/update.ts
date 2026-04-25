import { z } from "zod";
import { protectedProcedure } from "../../middleware/auth";

export const updateEventProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      date: z.string().optional(),
      time: z.string().optional(),
      type: z.enum(['Competition', 'Workshop', 'Showcase', 'Camp']).optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.time !== undefined) updateData.time = input.time;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;

    const { data, error } = await ctx.supabase
      .from("events")
      .update(updateData)
      .eq("id", input.id)
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
