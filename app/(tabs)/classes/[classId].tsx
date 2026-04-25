import React, { useState, useMemo } from 'react';
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
  Clock,
  Users,
  Calendar,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();
  const { bookMultipleDates, getStudentBookings, getClassBookings } = useBooking();

  const { data: classes = [], isLoading: classesLoading } =
    trpc.classes.getAll.useQuery();

  const { data: coaches = [] } =
    trpc.coaches.getAll.useQuery();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const classData = classes.find((c: any) => c.id === classId);
  const coach = classData
    ? coaches.find((c: any) => c.id === classData.coachId)
    : null;

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const calendarDates = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
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

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(formatDateString(date));
  };

  const getNext4Dates = () => {
    if (!classData) return [];
    const dates: string[] = [];
    let d = selectedDate ? new Date(selectedDate) : new Date(today);

    while (dates.length < 4) {
      if (d >= today && d.getDay() === classData.dayOfWeek) {
        dates.push(formatDateString(d));
      }
      d.setDate(d.getDate() + 1);
    }

    return dates;
  };

  if (classesLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!classData) {
    return <View style={styles.container}><Text>Class not found</Text></View>;
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
    if (!student) return;

    const studentId = `${user.id}-${student.id}`;
    const dates = getNext4Dates();

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

        <View style={[
          styles.levelBadge,
          classData.level === 'Beginner' && styles.levelBadgeBeginner,
          classData.level === 'Intermediate' && styles.levelBadgeIntermediate,
          classData.level === 'Advanced' && styles.levelBadgeAdvanced,
        ]}>
          <Text style={styles.levelBadgeText}>{classData.level}</Text>
        </View>
      </LinearGradient>

      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <ChevronLeft size={24}/>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <ChevronRight size={24}/>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {dayNames.map((d) => (
            <Text key={d} style={styles.dayNameText}>{d}</Text>
          ))}

          {calendarDates.map((date, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelectDate(date)}
              disabled={!isDateAvailable(date)}
              style={[
                styles.dateCell,
                isDateSelected(date) && styles.dateCellSelected,
              ]}
            >
              <Text>{date.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBookClass}>
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
  className: { fontSize: 24, color: '#fff' },
  classAgeGroup: { color: '#FFD700' },
  levelBadge: { padding: 8, borderRadius: 10 },
  levelBadgeBeginner: { backgroundColor: '#e3f2fd' },
  levelBadgeIntermediate: { backgroundColor: '#fff3e0' },
  levelBadgeAdvanced: { backgroundColor: '#fce4ec' },
  levelBadgeText: { color: '#000' },
  calendarSection: { padding: 16 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  monthTitle: { fontSize: 18 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayNameText: { width: '14.28%', textAlign: 'center' },
  dateCell: { width: '14.28%', padding: 10, alignItems: 'center' },
  dateCellSelected: { backgroundColor: '#007AFF' },
  bookButton: { padding: 16, backgroundColor: 'gold', margin: 20 },
  bookButtonText: { textAlign: 'center', fontWeight: 'bold' },
});
