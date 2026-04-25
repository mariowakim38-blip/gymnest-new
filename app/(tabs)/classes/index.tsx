import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import {
  Clock,
  ChevronRight,
  CalendarDays,
  Sparkles,
  Users as UsersIcon,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBooking } from '@/contexts/BookingContext';
import { supabase } from '@/lib/supabase';

const orderedDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const dayShort: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

const timeToMinutes = (timeValue: string) => {
  if (!timeValue) return 0;

  const [time, modifier] = timeValue.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const getEndTime = (startTime: string) => {
  const start = timeToMinutes(startTime);
  const end = start + 60;

  let hours = Math.floor(end / 60);
  const minutes = end % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${String(minutes).padStart(2, '0')} ${modifier}`;
};

export default function ClassesScreen() {
  const router = useRouter();
  const { bookings } = useBooking();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setLoadError('');

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error('CLASSES ERROR:', error);
        setLoadError(error.message);
        setClasses([]);
        setIsLoading(false);
        return;
      }

      const mappedClasses = (data ?? []).map((c: any) => ({
        id: c.id,
        name: c.name ?? '',
        ageGroup: c.age_group ?? '',
        level: c.level ?? '',
        day: c.day ?? '',
        time: c.time ?? '',
        duration: c.duration ?? '1 hour',
        capacity: c.capacity ?? 0,
        enrolled: c.enrolled ?? 0,
        description: c.description ?? '',
        dayOfWeek: c.day_of_week ?? 0,
      }));

      setClasses(mappedClasses);

      const firstAvailableDay = orderedDays.find((day) =>
        mappedClasses.some((cls) => cls.day === day)
      );

      if (firstAvailableDay) {
        setSelectedDay(firstAvailableDay);
      }

      setIsLoading(false);
    };

    fetchClasses();
  }, []);

  const getEnrolledCount = (classId: string) => {
    const classBookings = bookings.filter(
      (booking) => booking.classId === classId && booking.status !== 'cancelled'
    );

    const uniqueStudents = new Set(
      classBookings.map((booking) => booking.studentId)
    );

    return uniqueStudents.size;
  };

  const groupedByDay = useMemo(() => {
    return classes.reduce((acc: Record<string, any[]>, cls: any) => {
      if (!acc[cls.day]) acc[cls.day] = [];
      acc[cls.day].push(cls);
      return acc;
    }, {});
  }, [classes]);

  const availableDays = orderedDays.filter((day) => groupedByDay[day]?.length);

  const selectedDayClasses = useMemo(() => {
    return [...(groupedByDay[selectedDay] ?? [])].sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );
  }, [groupedByDay, selectedDay]);

  const getLevelStyle = (level: string) => {
    if (level?.toLowerCase().includes('beginner')) return styles.beginnerBadge;
    if (level?.toLowerCase().includes('advanced')) return styles.advancedBadge;
    return styles.intermediateBadge;
  };

  const getLevelTextStyle = (level: string) => {
    if (level?.toLowerCase().includes('beginner')) return styles.beginnerText;
    if (level?.toLowerCase().includes('advanced')) return styles.advancedText;
    return styles.intermediateText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View>
          <View style={styles.heroPill}>
            <Sparkles color={Colors.primary} size={15} />
            <Text style={styles.heroPillText}>Choose your training day</Text>
          </View>

          <Text style={styles.title}>Weekly Class Schedule</Text>
          <Text style={styles.subtitle}>
            Pick a day, choose your class time, then book your 4 sessions.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centerText}>Loading schedule...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Error: {loadError}</Text>
        </View>
      ) : availableDays.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.centerText}>No classes available yet.</Text>
        </View>
      ) : (
        <>
          <View style={styles.daysSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysContent}
            >
              {availableDays.map((day) => {
                const isActive = selectedDay === day;
                const count = groupedByDay[day]?.length ?? 0;

                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.85}
                    onPress={() => setSelectedDay(day)}
                    style={[styles.dayCard, isActive && styles.dayCardActive]}
                  >
                    <Text style={[styles.dayShort, isActive && styles.dayShortActive]}>
                      {dayShort[day]}
                    </Text>
                    <Text style={[styles.dayFull, isActive && styles.dayFullActive]}>
                      {day}
                    </Text>
                    <Text style={[styles.dayCount, isActive && styles.dayCountActive]}>
                      {count} classes
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.scheduleList}
            contentContainerStyle={styles.scheduleContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.selectedHeader}>
              <CalendarDays color={Colors.primary} size={22} />
              <View>
                <Text style={styles.selectedTitle}>{selectedDay}</Text>
                <Text style={styles.selectedSubtitle}>
                  {selectedDayClasses.length} available class times
                </Text>
              </View>
            </View>

            {selectedDayClasses.map((cls: any) => {
              const enrolled = getEnrolledCount(cls.id);
              const capacity = cls.capacity || 12;
              const isFull = capacity > 0 && enrolled >= capacity;
              const endTime = getEndTime(cls.time);

              return (
                <TouchableOpacity
                  key={cls.id}
                  activeOpacity={0.86}
                  disabled={isFull}
                  style={[styles.classCard, isFull && styles.classCardFull]}
                  onPress={() => router.push(`/(tabs)/classes/${cls.id}` as Href)}
                >
                  <View style={styles.timeRail}>
                    <Text style={styles.startTime}>{cls.time}</Text>
                    <View style={styles.timeLine} />
                    <Text style={styles.endTime}>{endTime}</Text>
                  </View>

                  <View style={styles.classMain}>
                    <View style={styles.classTopRow}>
                      <View style={styles.classTitleWrap}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Text style={styles.classMeta}>{cls.ageGroup || 'Kids'}</Text>
                      </View>

                      <View style={[styles.levelBadge, getLevelStyle(cls.level)]}>
                        <Text style={[styles.levelText, getLevelTextStyle(cls.level)]}>
                          {cls.level || 'Class'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.classDescription} numberOfLines={2}>
                      {cls.description || 'Gymnastics training class.'}
                    </Text>

                    <View style={styles.classBottomRow}>
                      <View style={styles.infoChip}>
                        <Clock color={Colors.mediumGray} size={15} />
                        <Text style={styles.infoChipText}>{cls.duration || '1 hour'}</Text>
                      </View>

                      <View style={styles.infoChip}>
                        <UsersIcon color={Colors.mediumGray} size={15} />
                        <Text style={styles.infoChipText}>
                          {enrolled}/{capacity} booked
                        </Text>
                      </View>

                      <View style={[styles.statusPill, isFull && styles.statusPillFull]}>
                        <Text style={[styles.statusText, isFull && styles.statusTextFull]}>
                          {isFull ? 'Full' : 'Available'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ChevronRight color={isFull ? Colors.mediumGray : Colors.primary} size={22} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  hero: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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

  heroPillText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },

  daysSection: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  daysContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },

  dayCard: {
    width: 122,
    paddingVertical: 14,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: '#E3E8EF',
  },

  dayCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  dayShort: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '800',
    marginBottom: 4,
  },

  dayShortActive: {
    color: '#DCEEFF',
  },

  dayFull: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '900',
  },

  dayFullActive: {
    color: Colors.white,
  },

  dayCount: {
    marginTop: 5,
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },

  dayCountActive: {
    color: '#EAF4FF',
  },

  scheduleList: {
    flex: 1,
  },

  scheduleContent: {
    padding: 16,
    paddingBottom: 32,
  },

  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  selectedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },

  selectedSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 1,
  },

  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EBF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  classCardFull: {
    opacity: 0.55,
  },

  timeRail: {
    width: 78,
    alignItems: 'center',
  },

  startTime: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
  },

  timeLine: {
    width: 2,
    height: 34,
    backgroundColor: '#D7E7F8',
    marginVertical: 6,
    borderRadius: 2,
  },

  endTime: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '700',
    textAlign: 'center',
  },

  classMain: {
    flex: 1,
  },

  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  classTitleWrap: {
    flex: 1,
  },

  className: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 3,
  },

  classMeta: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },

  classDescription: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },

  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  beginnerBadge: {
    backgroundColor: '#E3F2FD',
  },

  intermediateBadge: {
    backgroundColor: '#FFF3E0',
  },

  advancedBadge: {
    backgroundColor: '#FCE4EC',
  },

  levelText: {
    fontSize: 12,
    fontWeight: '900',
  },

  beginnerText: {
    color: '#1976D2',
  },

  intermediateText: {
    color: '#F57C00',
  },

  advancedText: {
    color: '#C2185B',
  },

  classBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },

  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  infoChipText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '700',
  },

  statusPill: {
    backgroundColor: '#E8F8EF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusPillFull: {
    backgroundColor: '#FDECEC',
  },

  statusText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '900',
  },

  statusTextFull: {
    color: '#DC2626',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  centerText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
  },
});
