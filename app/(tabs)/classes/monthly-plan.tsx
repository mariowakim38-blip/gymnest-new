import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle,
  Lock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const packages = [4, 8, 12, 16, 20, 24, 28, 32];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDayName = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long' });

export default function MonthlyPlan() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setClasses(data ?? []);
    };

    fetchClasses();
  }, []);

  const weeklyHours = selectedPackage ? selectedPackage / 4 : 0;
  const selectedHours = selectedSlots.length;
  const remainingHours = weeklyHours - selectedHours;

  const selectedDays = useMemo(() => {
    return Array.from(new Set(selectedSlots.map((slot) => slot.day)));
  }, [selectedSlots]);

  const getSlotsForDay = (day: string) => {
    return classes
      .filter((c: any) => String(c.day || '').toLowerCase() === day.toLowerCase())
      .sort((a: any, b: any) => String(a.time || '').localeCompare(String(b.time || '')))
      .map((c: any) => ({
        id: c.id,
        day: c.day,
        time: c.time,
        level: c.level || 'Beginner',
        ageGroup: c.age_group || c.ageGroup || '',
        name: c.name || 'Gymnastics Class',
      }));
  };

  const isSlotSelected = (day: string, slotId: string) => {
    return selectedSlots.some((s) => s.day === day && String(s.id) === String(slotId));
  };

  const getSelectedSlotsForDay = (day: string) => {
    return selectedSlots.filter((s) => s.day === day);
  };

  const isBeginnerSlot = (slot: any) =>
    String(slot.level || '').toLowerCase().includes('beginner');

  const isSlotDisabled = (day: string, slot: any) => {
    if (!selectedPackage) return true;
    if (isSlotSelected(day, slot.id)) return false;

    const slotsForDay = getSelectedSlotsForDay(day);
    const hasBeginnerSameDay = slotsForDay.some((s) => isBeginnerSlot(s));
    const hasIntermediateSameDay = slotsForDay.some((s) => !isBeginnerSlot(s));

    if (hasBeginnerSameDay) return true;
    if (isBeginnerSlot(slot) && hasIntermediateSameDay) return true;
    if (selectedHours >= weeklyHours) return true;

    return false;
  };

  const handleSelectSlot = (day: string, slot: any) => {
    if (!selectedPackage) return;

    const disabled = isSlotDisabled(day, slot);
    const selected = isSlotSelected(day, slot.id);

    if (disabled && !selected) return;

    if (selected) {
      setSelectedSlots((current) =>
        current.filter((s) => !(s.day === day && String(s.id) === String(slot.id)))
      );
      return;
    }

    setSelectedSlots((current) => [...current, { ...slot, day }]);
  };

  const generateDates = (day: string, weeks = 4) => {
    if (!startDate) return [];

    const start = new Date(startDate);
    start.setHours(12, 0, 0, 0);

    const targetDay = dayMap[day];
    let diff = targetDay - start.getDay();
    if (diff < 0) diff += 7;

    const firstDate = new Date(start);
    firstDate.setDate(start.getDate() + diff);

    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(firstDate);
      d.setDate(firstDate.getDate() + i * 7);
      return formatLocalDate(d);
    });
  };

  const calendarDates = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    const dates: Date[] = [];
    const current = new Date(start);

    while (dates.length < 42) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [calendarMonth]);

  const isCalendarDateAllowed = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    if (check < today) return false;

    const dayName = getDayName(date);
    return selectedDays.includes(dayName);
  };

  const canGoNext = selectedPackage && selectedHours === weeklyHours;

  const handleGoNext = () => {
    if (!canGoNext) return;

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    let firstAllowedDate: Date | null = null;

    for (let i = 0; i < 14; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      if (isCalendarDateAllowed(d)) {
        firstAllowedDate = d;
        break;
      }
    }

    setStartDate(firstAllowedDate);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setStep(2);
  };

  const findMatchingClass = (slot: any) => {
    return classes.find((c: any) => String(c.id) === String(slot.id));
  };

  const goHomeAfterConfirmed = () => {
    router.replace('/' as any);
  };

  const handleConfirm = async () => {
    if (confirming) return;

    const student = user?.children?.[0];

    if (!user || !student) {
      Alert.alert(
        'Error',
        'No student found. Please log in with a parent account that has a child profile.'
      );
      return;
    }

    if (!startDate) {
      Alert.alert('Choose Start Date', 'Please choose a start date from the allowed calendar days.');
      return;
    }

    const allBookings: any[] = [];

    for (const slot of selectedSlots) {
      const classMatch = findMatchingClass(slot);

      if (!classMatch) {
        Alert.alert('Missing Class', `${slot.day} ${slot.time} was not found in your classes table.`);
        return;
      }

      const dates = generateDates(slot.day);

      for (const date of dates) {
        allBookings.push({
          profile_id: user.id,
          child_id: student.id,
          class_id: classMatch.id,
          booking_date: date,
          status: 'confirmed',
        });
      }
    }

    setConfirming(true);

    const { error } = await supabase.from('bookings').insert(allBookings);

    setConfirming(false);

    if (error) {
      Alert.alert('Booking Error', error.message);
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('Booking Confirmed ✅\n\nYour class schedule has been successfully booked.');
      goHomeAfterConfirmed();
      return;
    }

    Alert.alert(
      'Booking Confirmed ✅',
      'Your class schedule has been successfully booked.',
      [
        {
          text: 'OK',
          onPress: goHomeAfterConfirmed,
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroSmall}>Monthly Training Plan</Text>
        <Text style={styles.heroTitle}>Build your child’s schedule</Text>
        <Text style={styles.heroSubtitle}>
          Choose a package, select weekly classes, then choose the first attendance date.
        </Text>
      </View>

      <View style={styles.steps}>
        <View style={[styles.stepPill, step === 1 && styles.stepPillActive]}>
          <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>
            1. Schedule
          </Text>
        </View>

        <View style={[styles.stepPill, step === 2 && styles.stepPillActive]}>
          <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>
            2. Start Date
          </Text>
        </View>
      </View>

      {step === 1 && (
        <>
          <Text style={styles.sectionTitle}>Choose Package</Text>

          <View style={styles.packageGrid}>
            {packages.map((p) => {
              const active = selectedPackage === p;

              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.packageCard, active && styles.packageCardActive]}
                  onPress={() => {
                    setSelectedPackage(p);
                    setSelectedSlots([]);
                    setStartDate(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.packageHours, active && styles.packageHoursActive]}>
                    {p}h
                  </Text>
                  <Text style={[styles.packageLabel, active && styles.packageLabelActive]}>
                    per month
                  </Text>
                  <Text style={[styles.packageWeekly, active && styles.packageWeeklyActive]}>
                    {p / 4}h/week
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPackage && (
            <>
              <View style={styles.progressBox}>
                <Text style={styles.progressTitle}>Select {weeklyHours} hours per week</Text>
                <Text style={styles.progressText}>
                  Selected: {selectedHours}/{weeklyHours} hours
                </Text>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((selectedHours / weeklyHours) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.remainingText}>
                  {remainingHours === 0
                    ? 'Perfect. You can continue.'
                    : `${remainingHours} hour(s) remaining`}
                </Text>
              </View>

              {days.map((day) => {
                const slots = getSlotsForDay(day);
                const beginnerSelected = selectedSlots.some(
                  (s) => s.day === day && isBeginnerSlot(s)
                );

                return (
                  <View key={day} style={styles.dayBlock}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>{day}</Text>

                      {beginnerSelected && (
                        <Text style={styles.lockNote}>Beginner day locked to 1h</Text>
                      )}
                    </View>

                    {slots.length === 0 ? (
                      <Text style={styles.noSlotsText}>No classes available on {day}.</Text>
                    ) : (
                      <View style={styles.slotsGrid}>
                        {slots.map((slot) => {
                          const selected = isSlotSelected(day, slot.id);
                          const disabled = isSlotDisabled(day, slot) && !selected;

                          return (
                            <TouchableOpacity
                              key={slot.id}
                              style={[
                                styles.slotCard,
                                selected && styles.slotCardSelected,
                                disabled && styles.slotCardDisabled,
                              ]}
                              disabled={disabled}
                              onPress={() => handleSelectSlot(day, slot)}
                              activeOpacity={0.85}
                            >
                              <View style={styles.slotTopRow}>
                                <Text
                                  style={[
                                    styles.slotTime,
                                    selected && styles.slotTextSelected,
                                    disabled && styles.disabledText,
                                  ]}
                                >
                                  {slot.time}
                                </Text>

                                {disabled && <Lock color={Colors.textLight} size={13} />}
                              </View>

                              <Text
                                style={[
                                  styles.slotLevel,
                                  selected && styles.slotTextSelected,
                                  disabled && styles.disabledText,
                                ]}
                              >
                                {slot.level}
                              </Text>

                              {!!slot.ageGroup && (
                                <Text
                                  style={[
                                    styles.slotAgeGroup,
                                    selected && styles.slotTextSelected,
                                    disabled && styles.disabledText,
                                  ]}
                                >
                                  {slot.ageGroup}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.primaryButton, !canGoNext && styles.disabledButton]}
                disabled={!canGoNext}
                onPress={handleGoNext}
              >
                <Text style={styles.primaryButtonText}>Next: Choose Start Date</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <CheckCircle color={Colors.success} size={22} />
              <Text style={styles.reviewTitle}>Schedule Summary</Text>
            </View>

            <Text style={styles.reviewText}>
              Package: {selectedPackage}h/month • {weeklyHours}h/week
            </Text>

            <Text style={styles.allowedDaysText}>
              Calendar enabled days: {selectedDays.join(', ')}
            </Text>

            {selectedSlots.map((slot, index) => (
              <Text key={`${slot.id}-${index}`} style={styles.reviewItem}>
                {slot.day} — {slot.time} — {slot.level}
              </Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Choose Start Date</Text>
          <Text style={styles.calendarHint}>
            Only the days selected in your weekly schedule are available.
          </Text>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft size={24} color={Colors.primary} />
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {calendarMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.weekDay}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDates.map((date, index) => {
                const sameMonth = date.getMonth() === calendarMonth.getMonth();
                const allowed = isCalendarDateAllowed(date);
                const selected =
                  startDate && formatLocalDate(date) === formatLocalDate(startDate);

                return (
                  <TouchableOpacity
                    key={index}
                    disabled={!allowed}
                    style={[
                      styles.calendarCell,
                      !sameMonth && styles.calendarCellMuted,
                      !allowed && styles.calendarCellDisabled,
                      selected && styles.calendarCellSelected,
                    ]}
                    onPress={() => allowed && setStartDate(date)}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        !sameMonth && styles.calendarCellTextMuted,
                        !allowed && styles.calendarCellTextDisabled,
                        selected && styles.calendarCellTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.startBox}>
            <CalendarDays color={Colors.primary} size={20} />
            <Text style={styles.startText}>
              Start date: {startDate ? startDate.toDateString() : 'Choose an allowed date'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!startDate || confirming) && styles.disabledButton]}
            disabled={!startDate || confirming}
            onPress={handleConfirm}
          >
            <Text style={styles.primaryButtonText}>
              {confirming ? 'Confirming...' : 'Confirm Monthly Booking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
            <Text style={styles.secondaryButtonText}>Back to Schedule</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  heroSmall: { color: '#DDEEFF', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 8 },
  heroSubtitle: { color: '#EAF4FF', fontSize: 14, lineHeight: 20 },
  steps: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  stepPill: { flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: '#E8ECF2', alignItems: 'center' },
  stepPillActive: { backgroundColor: Colors.primary },
  stepText: { color: Colors.textLight, fontWeight: '800' },
  stepTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 12 },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  packageCard: { width: '23%', minWidth: 80, backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  packageCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  packageHours: { fontSize: 22, fontWeight: '900', color: Colors.text },
  packageHoursActive: { color: '#fff' },
  packageLabel: { color: Colors.textLight, fontSize: 12, marginTop: 2 },
  packageLabelActive: { color: '#EAF4FF' },
  packageWeekly: { color: Colors.primary, fontSize: 12, fontWeight: '800', marginTop: 8 },
  packageWeeklyActive: { color: '#fff' },
  progressBox: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  progressTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  progressText: { marginTop: 4, color: Colors.textLight, fontWeight: '700' },
  progressBar: { height: 10, backgroundColor: '#E8ECF2', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  remainingText: { marginTop: 8, color: Colors.primary, fontWeight: '800' },
  dayBlock: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 },
  dayTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  lockNote: { fontSize: 12, fontWeight: '800', color: Colors.primary, backgroundColor: '#EAF4FF', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  noSlotsText: { color: Colors.textLight, fontWeight: '700', paddingVertical: 8 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: { width: '48%', padding: 12, borderRadius: 14, backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E2E8F0' },
  slotCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotCardDisabled: { backgroundColor: '#EEF1F5', opacity: 0.45 },
  slotTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotTime: { fontSize: 15, fontWeight: '900', color: Colors.text },
  slotLevel: { fontSize: 12, color: Colors.textLight, marginTop: 4, fontWeight: '700' },
  slotAgeGroup: { fontSize: 11, color: Colors.textLight, marginTop: 2, fontWeight: '700' },
  slotTextSelected: { color: '#fff' },
  disabledText: { color: Colors.textLight },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  disabledButton: { opacity: 0.45 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '900' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reviewTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  reviewText: { color: Colors.text, fontWeight: '800', marginBottom: 8 },
  allowedDaysText: { color: Colors.primary, fontWeight: '800', marginBottom: 8 },
  reviewItem: { color: Colors.textLight, marginTop: 4, fontWeight: '600' },
  calendarHint: { marginTop: -4, marginBottom: 12, color: Colors.textLight, fontWeight: '700' },
  calendarCard: { backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  calendarTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { width: '14.28%', textAlign: 'center', color: Colors.textLight, fontWeight: '900', fontSize: 12 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999, marginVertical: 2 },
  calendarCellMuted: { opacity: 0.25 },
  calendarCellDisabled: { opacity: 0.25 },
  calendarCellSelected: { backgroundColor: Colors.primary, opacity: 1 },
  calendarCellText: { color: Colors.text, fontWeight: '800' },
  calendarCellTextMuted: { color: Colors.textLight },
  calendarCellTextDisabled: { color: Colors.textLight },
  calendarCellTextSelected: { color: '#fff' },
  startBox: { backgroundColor: '#EAF4FF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  startText: { color: Colors.primary, fontWeight: '900' },
});
