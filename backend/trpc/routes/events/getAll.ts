import { publicProcedure } from "../../middleware/auth";

export const getAllEventsProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    type: e.type,
    description: e.description,
    location: e.location,
    imageUrl: e.image_url,
  }));
});
