import { publicProcedure } from '../../create-context';

export const getAllClassesProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('classes')
    .select('*');

  if (error) {
    console.error('SUPABASE CLASSES ERROR:', error);
    throw new Error(error.message);
  }

  console.log('SUPABASE CLASSES DATA:', data);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    ageGroup: c.age_group ?? '',
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
