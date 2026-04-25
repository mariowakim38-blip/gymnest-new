import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const getAllBookingsProcedure = protectedProcedure.query(async ({ ctx }) => {
  requireAdmin(ctx);

  const { data: bookings, error: bookingsError } = await ctx.supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: false });

  if (bookingsError) throw new Error(bookingsError.message);

  const safeBookings = bookings ?? [];
  const profileIds = [...new Set(safeBookings.map((b) => b.profile_id).filter(Boolean))];
  const childIds = [...new Set(safeBookings.map((b) => b.child_id).filter(Boolean))];
  const classIds = [...new Set(safeBookings.map((b) => b.class_id).filter(Boolean))];

  const [{ data: profiles }, { data: children }, { data: classes }] = await Promise.all([
    profileIds.length
      ? ctx.supabase.from('profiles').select('id, name, phone_number').in('id', profileIds)
      : Promise.resolve({ data: [] as any[] }),
    childIds.length
      ? ctx.supabase.from('children').select('id, name, age, profile_id').in('id', childIds)
      : Promise.resolve({ data: [] as any[] }),
    classIds.length
      ? ctx.supabase.from('classes').select('id, name, age_group, level, day, time, duration, coach_id, capacity, enrolled, description, day_of_week').in('id', classIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const childById = new Map((children ?? []).map((c: any) => [c.id, c]));
  const classById = new Map((classes ?? []).map((c: any) => [c.id, c]));

  return safeBookings.map((booking: any) => {
    const parent = profileById.get(booking.profile_id);
    const child = childById.get(booking.child_id);
    const classItem = classById.get(booking.class_id);

    return {
      id: booking.id,
      profileId: booking.profile_id,
      childId: booking.child_id,
      classId: booking.class_id,
      studentId: `${booking.profile_id}-${booking.child_id}`,
      bookingDate: booking.created_at || new Date().toISOString(),
      classDate: booking.booking_date || new Date().toISOString(),
      status: booking.status || 'confirmed',
      attended: booking.attended === true ? true : booking.attended === false ? false : undefined,
      attendanceMarkedAt: booking.attended !== null && booking.attended !== undefined ? booking.updated_at : undefined,

      parentName: parent?.name || 'Unknown Parent',
      parentPhone: parent?.phone_number || '',
      childName: child?.name || 'Unknown Child',
      childAge: child?.age ?? '',

      className: classItem?.name || 'Unknown Class',
      classAgeGroup: classItem?.age_group || '',
      classLevel: classItem?.level || '',
      classDay: classItem?.day || '',
      classTime: classItem?.time || '',
      classDuration: classItem?.duration || '',
      classSchedule: classItem ? `${classItem.day || ''} ${classItem.time || ''}`.trim() : '',
    };
  });
});
