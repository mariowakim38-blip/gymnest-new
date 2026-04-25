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
import { classes, coaches } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { bookMultipleDates, getStudentBookings, getClassBookings } = useBooking();

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

  const classData = classes.find((c) => c.id === classId);
  const coach = classData ? coaches.find((c) => c.id === classData.coachId) : null;

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
            classData.level === 'Advanced' && styles.levelBadgeAdvanced,
          ]}
        >
          <Text style={styles.levelBadgeText}>{classData.level}</Text>
        </View>
      </LinearGradient>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Class Details</Text>
        <Text style={styles.description}>{classData.description}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Calendar color={Colors.gold} size={24} />
            <Text style={styles.detailLabel}>Schedule</Text>
            <Text style={styles.detailValue}>{classData.day}</Text>
            <Text style={styles.detailSubValue}>{classData.time}</Text>
          </View>

          <View style={styles.detailCard}>
            <Clock color={Colors.gold} size={24} />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{classData.duration}</Text>
          </View>

          <View style={styles.detailCard}>
            <Users color={Colors.gold} size={24} />
            <Text style={styles.detailLabel}>Capacity</Text>
            <Text style={styles.detailValue}>{classData.capacity} spots</Text>
            <Text style={styles.detailSubValue}>per class</Text>
          </View>

          <View style={styles.detailCard}>
            <MapPin color={Colors.gold} size={24} />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>Main</Text>
            <Text style={styles.detailSubValue}>Arena</Text>
          </View>
        </View>
      </View>

      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Select a Start Date</Text>

        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.monthButton} onPress={goToPreviousMonth}>
            <ChevronLeft color={Colors.mediumGray} size={24} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>

          <TouchableOpacity style={styles.monthButton} onPress={goToNextMonth}>
            <ChevronRight color={Colors.mediumGray} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}

          {calendarDates.map((date, index) => {
            const available = isDateAvailable(date);
            const selected = isDateSelected(date);
            const inMonth = isCurrentMonth(date);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCell,
                  !inMonth && styles.dateCellOutside,
                  available && styles.dateCellAvailable,
                  selected && styles.dateCellSelected,
                ]}
                disabled={!available}
                onPress={() => handleSelectDate(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateText,
                    !inMonth && styles.dateTextOutside,
                    available && styles.dateTextAvailable,
                    selected && styles.dateTextSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDate ? (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateLabel}>Selected Start Date:</Text>
            <Text style={styles.selectedDateValue}>
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            <Text style={styles.availabilityInfo}>
              {`${bookingsForSelectedDate.length}/${classData.capacity} spots booked${
                isFull ? ' (Full - Waitlist Available)' : ` (${spotsLeft} spots left)`
              }`}
            </Text>
          </View>
        ) : (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateLabel}>No date selected</Text>
            <Text style={styles.selectedDateValue}>
              Tap an available {classData.day} to choose when the 4 bookings start.
            </Text>
          </View>
        )}
      </View>

      {coach && (
        <View style={styles.coachSection}>
          <Text style={styles.sectionTitle}>Your Coach</Text>

          <View style={styles.coachCard}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>{coach.name.charAt(0)}</Text>
            </View>

            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{coach.name}</Text>

              <View style={styles.coachSpecialization}>
                <Award color={Colors.primary} size={16} />
                <Text style={styles.coachSpecializationText}>
                  {coach.specialization}
                </Text>
              </View>

              <Text style={styles.coachExperience}>{coach.experience} experience</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bookingSection}>
        <TouchableOpacity
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
          onPress={handleBookClass}
          disabled={isBooking}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFull ? [Colors.warning, '#e0a800'] : [Colors.gold, '#c49b2e']}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>
              {isBooking ? 'Booking...' : 'Book Next 4 Classes'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  className: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  classAgeGroup: {
    fontSize: 16,
    color: Colors.gold,
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeBeginner: {
    backgroundColor: '#e3f2fd',
  },
  levelBadgeIntermediate: {
    backgroundColor: '#fff3e0',
  },
  levelBadgeAdvanced: {
    backgroundColor: '#fce4ec',
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  detailSubValue: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNameCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dateCellOutside: {
    opacity: 0.3,
  },
  dateCellAvailable: {
    backgroundColor: Colors.lightGray,
  },
  dateCellSelected: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  dateTextOutside: {
    color: Colors.mediumGray,
  },
  dateTextAvailable: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  dateTextSelected: {
    color: Colors.white,
    fontWeight: 'bold' as const,
  },
  selectedDateInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  availabilityInfo: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  coachSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  coachCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coachAvatarText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  coachInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  coachSpecialization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  coachSpecializationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  coachExperience: {
    fontSize: 13,
    color: Colors.textLight,
  },
  bookingSection: {
    paddingHorizontal: 16,
  },
  bookButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
