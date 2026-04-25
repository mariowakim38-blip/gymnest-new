import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const packages = [4, 8, 12, 16, 20, 24, 28, 32];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeSlots = [
  { time: '4:30 PM', level: 'Beginner' },
  { time: '5:30 PM', level: 'Intermediate/Advanced' },
  { time: '6:30 PM', level: 'Intermediate/Advanced' },
  { time: '7:30 PM', level: 'Intermediate/Advanced' },
];

const dayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getTodayAtNoon = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
};

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

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from('classes').select('*');

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

  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some((s) => s.day === day && s.time === time);
  };

  const handleSelectSlot = (day: string, slot: any) => {
    if (!selectedPackage) return;

    const exists = isSlotSelected(day, slot.time);

    if (slot.level === 'Beginner') {
      const alreadySelectedSameDay = selectedSlots.some((s) => s.day === day);
      if (alreadySelectedSameDay && !exists) {
        Alert.alert('Beginner Rule', 'Beginner classes are limited to 1 hour per day.');
        return;
      }
    }

    let updated = [...selectedSlots];

    if (exists) {
      updated = updated.filter((s) => !(s.day === day && s.time === slot.time));
    } else {
      if (updated.length >= weeklyHours) {
        Alert.alert('Limit Reached', `This package allows ${weeklyHours} hours per week.`);
        return;
      }

      updated.push({ day, ...slot });
    }

    setSelectedSlots(updated);
    setStartDate(null);
  };

  const isDateAllowed = (date: Date) => {
    const today = getTodayAtNoon();
    const candidate = new Date(date);
    candidate.setHours(12, 0, 0, 0);

    if (candidate < today) return false;

    const dayName = dayNames[candidate.getDay()];
    return selectedDays.includes(dayName);
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

  const canGoNext = selectedPackage && selectedHours === weeklyHours;

  const goNext = () => {
    if (!canGoNext) {
      Alert.alert('Complete Schedule', `Please select exactly ${weeklyHours} hours per week.`);
      return;
    }

    setStep(2);
  };

  const handleConfirm = async () => {
    const student = user?.children?.[0];

    if (!user || !student) {
      Alert.alert('Error', 'No student found.');
      return;
    }

    if (!startDate) {
      Alert.alert('Start Date Required', 'Choose one of the available start dates.');
      return;
    }

    const allBookings: any[] = [];

    for (const slot of selectedSlots) {
      const classMatch = classes.find(
        (c) => String(c.day) === String(slot.day) && String(c.time) === String(slot.time)
      );

      if (!classMatch) {
        Alert.alert('Missing Class', `No class found for ${slot.day} at ${slot.time}.`);
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

    const { error } = await supabase.from('bookings').insert(allBookings);

    if (error) {
      Alert.alert('Booking Error', error.message);
      return;
    }

    Alert.alert('Success', 'Monthly schedule created successfully.');
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroPill}>
          <Sparkles color={Colors.primary} size={15} />
          <Text style={styles.heroPillText}>Monthly Training Plan</Text>
        </View>
        <Text style={styles.heroTitle}>Build your child’s schedule</Text>
        <Text style={styles.heroSubtitle}>
          Choose a package, select weekly classes, then choose only from the allowed start days.
        </Text>
      </View>

      <View style={styles.steps}>
        <View style={[styles.stepPill, step === 1 && styles.stepPillActive]}>
          <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>1. Schedule</Text>
        </View>
        <View style={[styles.stepPill, step === 2 && styles.stepPillActive]}>
          <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>2. Start Date</Text>
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
                  <Text style={[styles.packageHours, active && styles.packageHoursActive]}>{p}h</Text>
                  <Text style={[styles.packageLabel, active && styles.packageLabelActive]}>per month</Text>
                  <Text style={[styles.packageWeekly, active && styles.packageWeeklyActive]}>{p / 4}h/week</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPackage && (
            <>
              <View style={styles.progressBox}>
                <Text style={styles.progressTitle}>Select {weeklyHours} hours per week</Text>
                <Text style={styles.progressText}>Selected: {selectedHours}/{weeklyHours} hours</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((selectedHours / weeklyHours) * 100, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.remainingText}>
                  {remainingHours === 0 ? 'Perfect. Continue to calendar.' : `${remainingHours} hour(s) remaining`}
                </Text>
              </View>

              {days.map((day) => (
                <View key={day} style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{day}</Text>

                  <View style={styles.slotsGrid}>
                    {timeSlots.map((slot) => {
                      const selected = isSlotSelected(day, slot.time);

                      return (
                        <TouchableOpacity
                          key={slot.time}
                          style={[styles.slotCard, selected && styles.slotCardSelected]}
                          onPress={() => handleSelectSlot(day, slot)}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.slotTime, selected && styles.slotTextSelected]}>{slot.time}</Text>
                          <Text style={[styles.slotLevel, selected && styles.slotTextSelected]}>{slot.level}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.primaryButton, !canGoNext && styles.disabledButton]}
                disabled={!canGoNext}
                onPress={goNext}
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

            <Text style={styles.reviewText}>Package: {selectedPackage}h/month • {weeklyHours}h/week</Text>
            <Text style={styles.allowedDaysText}>Allowed start days: {selectedDays.join(', ')}</Text>

            {selectedSlots.map((slot, index) => (
              <Text key={`${slot.day}-${slot.time}-${index}`} style={styles.reviewItem}>
                {slot.day} — {slot.time} — {slot.level}
              </Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Choose Start Date</Text>
          <Text style={styles.calendarHint}>Only your selected training days are available.</Text>

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
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                <Text key={d} style={styles.weekDay}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDates.map((date, index) => {
                const sameMonth = date.getMonth() === calendarMonth.getMonth();
                const allowed = isDateAllowed(date) && sameMonth;
                const selected = startDate ? formatLocalDate(date) === formatLocalDate(startDate) : false;

                return (
                  <TouchableOpacity
                    key={index}
                    disabled={!allowed}
                    style={[
                      styles.calendarCell,
                      !sameMonth && styles.calendarCellMuted,
                      sameMonth && !allowed && styles.calendarCellDisabled,
                      selected && styles.calendarCellSelected,
                    ]}
                    onPress={() => {
                      if (allowed) setStartDate(date);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        !sameMonth && styles.calendarCellTextMuted,
                        sameMonth && !allowed && styles.calendarCellTextDisabled,
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
              {startDate ? `Start date: ${startDate.toDateString()}` : 'Choose an available start date'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !startDate && styles.disabledButton]}
            disabled={!startDate}
            onPress={handleConfirm}
          >
            <Text style={styles.primaryButtonText}>Confirm Monthly Booking</Text>
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
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 12,
  },
  heroPillText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 8 },
  heroSubtitle: { color: '#EAF4FF', fontSize: 14, lineHeight: 20 },

  steps: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  stepPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#E8ECF2',
    alignItems: 'center',
  },
  stepPillActive: { backgroundColor: Colors.primary },
  stepText: { color: Colors.textLight, fontWeight: '800' },
  stepTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 12 },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  packageCard: {
    width: '23%',
    minWidth: 80,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packageCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  packageHours: { fontSize: 22, fontWeight: '900', color: Colors.text },
  packageHoursActive: { color: '#fff' },
  packageLabel: { color: Colors.textLight, fontSize: 12, marginTop: 2 },
  packageLabelActive: { color: '#EAF4FF' },
  packageWeekly: { color: Colors.primary, fontSize: 12, fontWeight: '800', marginTop: 8 },
  packageWeeklyActive: { color: '#fff' },

  progressBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  progressText: { marginTop: 4, color: Colors.textLight, fontWeight: '700' },
  progressBar: {
    height: 10,
    backgroundColor: '#E8ECF2',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  remainingText: { marginTop: 8, color: Colors.primary, fontWeight: '800' },

  dayBlock: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayTitle: { fontSize: 17, fontWeight: '900', marginBottom: 10, color: Colors.text },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTime: { fontSize: 15, fontWeight: '900', color: Colors.text },
  slotLevel: { fontSize: 12, color: Colors.textLight, marginTop: 4, fontWeight: '700' },
  slotTextSelected: { color: '#fff' },

  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: { opacity: 0.45 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '900' },

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reviewTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  reviewText: { color: Colors.text, fontWeight: '800', marginBottom: 8 },
  allowedDaysText: { color: Colors.primary, fontWeight: '800', marginBottom: 8 },
  reviewItem: { color: Colors.textLight, marginTop: 4, fontWeight: '600' },
  calendarHint: { color: Colors.textLight, fontWeight: '700', marginBottom: 10 },

  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    color: Colors.textLight,
    fontWeight: '900',
    fontSize: 12,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    marginVertical: 2,
  },
  calendarCellMuted: { opacity: 0.2 },
  calendarCellDisabled: { backgroundColor: '#F1F3F6', opacity: 0.5 },
  calendarCellSelected: { backgroundColor: Colors.primary, opacity: 1 },
  calendarCellText: { color: Colors.text, fontWeight: '800' },
  calendarCellTextMuted: { color: Colors.textLight },
  calendarCellTextDisabled: { color: '#A0A7B2' },
  calendarCellTextSelected: { color: '#fff' },

  startBox: {
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  startText: { color: Colors.primary, fontWeight: '900' },
});
