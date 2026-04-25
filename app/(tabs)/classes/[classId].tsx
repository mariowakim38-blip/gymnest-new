import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { supabase } from '@/lib/supabase';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();
  const { bookMultipleDates, getClassBookings } = useBooking();

  const [classData, setClassData] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) {
        console.error('CLASS DETAIL ERROR:', error);
        setClassData(null);
        setLoading(false);
        return;
      }

      const mappedClass = {
        id: data.id,
        name: data.name ?? '',
        ageGroup: data.age_group ?? '',
        level: data.level ?? '',
        day: data.day ?? '',
        time: data.time ?? '',
        duration: data.duration ?? '',
        coachId: data.coach_id ?? null,
        capacity: data.capacity ?? 0,
        enrolled: data.enrolled ?? 0,
        description: data.description ?? '',
        dayOfWeek: data.day_of_week ?? 0,
      };

      setClassData(mappedClass);

      if (mappedClass.coachId) {
        const { data: coachData } = await supabase
          .from('coaches')
          .select('*')
          .eq('id', mappedClass.coachId)
          .maybeSingle();

        setCoach(coachData ?? null);
      }

      setLoading(false);
    };

    fetchClass();
  }, [classId]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const calendarDates = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    const dates: Date[] = [];
    const current = new Date(start);

    while (dates.length < 42) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [currentMonth]);

  const isDateAvailable = (date: Date) => {
    if (!classData) return false;
    return date >= today && date.getDay() === classData.dayOfWeek;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate === formatDateString(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleSelectDate = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(formatDateString(date));
  };

  const getNext4Dates = () => {
    if (!classData) return [];

    const dates: string[] = [];
    const d = selectedDate ? new Date(selectedDate) : new Date(today);

    while (dates.length < 4) {
      if (d >= today && d.getDay() === classData.dayOfWeek) {
        dates.push(formatDateString(d));
      }

      d.setDate(d.getDate() + 1);
    }

    return dates;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.container}>
        <Text>Class not found</Text>
      </View>
    );
  }

  const bookingsForSelectedDate = selectedDate
    ? getClassBookings(classId, selectedDate)
    : [];

  const isFull = bookingsForSelectedDate.length >= classData.capacity;

  const handleBookClass = async () => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login' as Href);
      return;
    }

    const student = user.children?.[0];

    if (!student) {
      Alert.alert('Error', 'No student found');
      return;
    }

    const studentId = `${user.id}-${student.id}`;
    const dates = getNext4Dates();

    if (dates.length === 0) {
      Alert.alert('Error', 'Please select a date first');
      return;
    }

    const result = await bookMultipleDates(classId, studentId, dates);

    if (result.success) {
      Alert.alert('Success', 'Booked successfully');
      router.back();
    } else {
      Alert.alert('Error', result.error || 'Failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.header}>
        <Text style={styles.className}>{classData.name}</Text>
        <Text style={styles.classAgeGroup}>{classData.ageGroup}</Text>

        <View
          style={[
            styles.levelBadge,
            classData.level === 'Beginner' && styles.levelBadgeBeginner,
            classData.level === 'Intermediate' && styles.levelBadgeIntermediate,
            classData.level === 'Advanced' && styles.levelBadgeAdvanced,
          ]}
        >
          <Text style={styles.levelBadgeText}>{classData.level}</Text>
        </View>

        <Text style={styles.description}>{classData.description}</Text>
        <Text style={styles.info}>
          {classData.day}, {classData.time} ({classData.duration})
        </Text>
        <Text style={styles.info}>
          Coach: {coach?.name ?? 'No coach assigned'}
        </Text>
      </LinearGradient>

      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <ChevronLeft size={24} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <ChevronRight size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {dayNames.map((d) => (
            <Text key={d} style={styles.dayNameText}>
              {d}
            </Text>
          ))}

          {calendarDates.map((date, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelectDate(date)}
              disabled={!isDateAvailable(date)}
              style={[
                styles.dateCell,
                !isDateAvailable(date) && styles.dateCellDisabled,
                isDateSelected(date) && styles.dateCellSelected,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isDateSelected(date) && styles.dateTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, isFull && styles.bookButtonDisabled]}
        onPress={handleBookClass}
        disabled={isFull}
      >
        <Text style={styles.bookButtonText}>
          {isFull ? 'Full' : 'Book Next 4 Classes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 30, alignItems: 'center' },
  className: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  classAgeGroup: { color: '#FFD700', marginTop: 6 },
  description: { color: '#fff', marginTop: 12, textAlign: 'center' },
  info: { color: '#fff', marginTop: 8 },
  levelBadge: { padding: 8, borderRadius: 10, marginTop: 12 },
  levelBadgeBeginner: { backgroundColor: '#e3f2fd' },
  levelBadgeIntermediate: { backgroundColor: '#fff3e0' },
  levelBadgeAdvanced: { backgroundColor: '#fce4ec' },
  levelBadgeText: { color: '#000', fontWeight: 'bold' },
  calendarSection: { padding: 16 },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: { fontSize: 18, fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  dayNameText: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateCell: {
    width: '14.28%',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  dateCellDisabled: {
    opacity: 0.25,
  },
  dateCellSelected: {
    backgroundColor: '#007AFF',
  },
  dateText: {
    color: '#000',
  },
  dateTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookButton: {
    padding: 16,
    backgroundColor: 'gold',
    margin: 20,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
