import { publicProcedure } from '../../create-context';

export const getAllClassesProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('classes')
    .select('*')
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('GET ALL CLASSES ERROR:', error);
    throw new Error(error.message);
  }

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    ageGroup: c.age_group ?? c.category ?? '',
    level: c.level,
    day: c.day,
    time: c.time,
    duration: c.duration,
    coachId: c.coach_id ?? null,
    capacity: c.capacity ?? 0,
    enrolled: c.enrolled ?? 0,
    description: c.description ?? '',
    dayOfWeek: c.day_of_week ?? null,
  }));
});
