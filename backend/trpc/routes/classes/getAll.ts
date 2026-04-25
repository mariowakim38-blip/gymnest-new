import { publicProcedure } from '../../create-context';

export const getAllClassesProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('classes')
    .select('*')
    .order('day_of_week', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    ageGroup: c.age_group,
    level: c.level,
    day: c.day,
    time: c.time,
    duration: c.duration,
    coachId: c.coach_id,
    capacity: c.capacity,
    enrolled: c.enrolled,
    description: c.description,
    dayOfWeek: c.day_of_week,
  }));
});
