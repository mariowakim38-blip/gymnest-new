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
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const classData = classes.find((c: any) => c.id === classId);
  const coach = classData
    ? coaches.find((c: any) => c.id === classData.coachId)
    : null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calendarDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);

    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (dates.length < 42) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [currentMonth]);

  const isDateAvailable = (date: Date) => {
    if (!classData) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= today && checkDate.getDay() === classData.dayOfWeek;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate === formatDateString(date);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  const handleSelectDate = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(formatDateString(date));
  };

  const getNext4Dates = () => {
    if (!classData) return [];

    const dates: string[] = [];
    const startDate = selectedDate
      ? new Date(`${selectedDate}T00:00:00`)
      : new Date(today);

    startDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(startDate);

    while (dates.length < 4) {
      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate >= today && checkDate.getDay() === classData.dayOfWeek) {
        dates.push(formatDateString(checkDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  if (classesLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading class...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Class not found</Text>
      </View>
    );
  }

  const bookingsForSelectedDate = selectedDate
    ? getClassBookings(classId, selectedDate)
    : [];

  const isFull = selectedDate
    ? bookingsForSelectedDate.length >= classData.capacity
    : false;

  const spotsLeft = selectedDate
    ? classData.capacity - bookingsForSelectedDate.length
    : classData.capacity;

  const handleBookClass = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Login Required', 'Please log in to book a class', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/auth/login' as Href) },
      ]);
      return;
    }

    if (!user.children || user.children.length === 0) {
      Alert.alert('No Students', 'Please add a student to your profile first');
      return;
    }

    const student = user.children[0];
    const studentUniqueId = `${user.id}-${student.id}`;
    const datesToBook = getNext4Dates();

    if (datesToBook.length === 0) {
      Alert.alert('Error', 'No available dates found for this class');
      return;
    }

    const existingBookings = getStudentBookings(studentUniqueId);

    const alreadyBookedDates = datesToBook.filter((date) =>
      existingBookings.some(
        (booking) => booking.classId === classId && booking.classDate === date
      )
    );

    if (alreadyBookedDates.length > 0) {
      Alert.alert(
        'Already Booked',
        `This student is already booked on ${alreadyBookedDates.length} of these dates.`
      );
      return;
    }

    const datesList = datesToBook
      .map((date) =>
        new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      )
      .join(', ');

    Alert.alert(
      'Book 4 Classes',
      `This will book the next 4 ${classData.day} classes at ${classData.time}:\n\n${datesList}\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book All',
          onPress: async () => {
            setIsBooking(true);

            const result = await bookMultipleDates(
              classId,
              studentUniqueId,
              datesToBook
            );

            setIsBooking(false);

            if (result.success) {
              Alert.alert(
                'Success!',
                `Successfully booked 4 classes for ${student.name}!`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } else {
              Alert.alert(
                'Error',
                result.error || 'Failed to book classes. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.header}>
        <Text style={styles.className}>{classData.name}</Text>
        <Text style={styles.classAgeGroup}>{classData.ageGroup}</Text>

        <View
          style={[
            styles.levelBadge,
            classData.level === 'Beginner' && styles.levelBadgeBeginner,
            classData.level === 'Intermediate' && styles.levelBadgeIntermediate,
            classData.level === 'Advanced' && styles.level
