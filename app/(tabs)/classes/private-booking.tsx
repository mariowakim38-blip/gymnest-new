import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function PrivateBookingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedChildId, setSelectedChildId] = useState<string>(
    user?.children?.[0]?.id || ''
  );
  const [packageHours, setPackageHours] = useState<number>(4);
  const [sessionDuration, setSessionDuration] = useState<number>(1);
  const [weekday, setWeekday] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedChild = user?.children?.find((c) => c.id === selectedChildId);

  const generateSessionDates = () => {
    const sessionsCount = Math.ceil(packageHours / sessionDuration);
    const dates: string[] = [];

    const current = new Date(`${startDate}T12:00:00`);

    while (dates.length < sessionsCount) {
      if (current.getDay() === weekday) {
        dates.push(formatDate(current));
      }

      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const handleBookPrivate = async () => {
    if (!user?.id || !selectedChildId) {
      Alert.alert('Error', 'Please select a child.');
      return;
    }

    if (!startDate) {
      Alert.alert('Error', 'Please select a start date.');
      return;
    }

    setLoading(true);

    try {
      const sessionDates = generateSessionDates();

      const { data: booking, error: bookingError } = await supabase
        .from('private_bookings')
        .insert({
          profile_id: user.id,
          child_id: selectedChildId,
          title: 'Private Session',
          description: description.trim() || null,
          package_hours: packageHours,
          session_duration_hours: sessionDuration,
          start_date: startDate,
          selected_weekday: DAYS.find((d) => d.value === weekday)?.label || 'Monday',
          status: 'active',
        })
        .select()
        .single();

      if (bookingError) {
        Alert.alert('Error', bookingError.message);
        return;
      }

      const { error: sessionsError } = await supabase
        .from('private_booking_sessions')
        .insert(
          sessionDates.map((date) => ({
            private_booking_id: booking.id,
            session_date: date,
            attended: null,
            note: null,
          }))
        );

      if (sessionsError) {
        Alert.alert('Error', sessionsError.message);
        return;
      }

      Alert.alert('Success', 'Private booking created successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Private Sessions</Text>
      <Text style={styles.subtitle}>
        Choose your child, package, weekday, and start date.
      </Text>

      <Text style={styles.label}>Select Child</Text>
      <View style={styles.rowWrap}>
        {(user?.children || []).map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.option,
              selectedChildId === child.id && styles.optionActive,
            ]}
            onPress={() => setSelectedChildId(child.id)}
          >
            <Text
              style={[
                styles.optionText,
                selectedChildId === child.id && styles.optionTextActive,
              ]}
            >
              {child.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Package</Text>
      <View style={styles.row}>
        {[4, 8, 16].map((h) => (
          <TouchableOpacity
            key={h}
            style={[
              styles.option,
              packageHours === h && styles.optionActive,
            ]}
            onPress={() => setPackageHours(h)}
          >
            <Text
              style={[
                styles.optionText,
                packageHours === h && styles.optionTextActive,
              ]}
            >
              {h} Hours
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Session Duration</Text>
      <View style={styles.row}>
        {[1, 2].map((h) => (
          <TouchableOpacity
            key={h}
            style={[
              styles.option,
              sessionDuration === h && styles.optionActive,
            ]}
            onPress={() => setSessionDuration(h)}
          >
            <Text
              style={[
                styles.optionText,
                sessionDuration === h && styles.optionTextActive,
              ]}
            >
              {h} Hour{h > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Day</Text>
      <View style={styles.rowWrap}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[
              styles.option,
              weekday === d.value && styles.optionActive,
            ]}
            onPress={() => setWeekday(d.value)}
          >
            <Text
              style={[
                styles.optionText,
                weekday === d.value && styles.optionTextActive,
              ]}
            >
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Start Date</Text>

      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.currentTarget.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            fontSize: 16,
            marginBottom: 14,
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{startDate}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(`${startDate}T12:00:00`)}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setStartDate(formatDate(selectedDate));
                }
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Description / Notes</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Example: private work on flexibility, back walkover, handstand..."
        style={[styles.input, styles.textArea]}
        multiline
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>Child: {selectedChild?.name || 'Not selected'}</Text>
        <Text style={styles.summaryText}>Package: {packageHours} hours</Text>
        <Text style={styles.summaryText}>
          Sessions: {Math.ceil(packageHours / sessionDuration)}
        </Text>
        <Text style={styles.summaryText}>
          Day: {DAYS.find((d) => d.value === weekday)?.label}
        </Text>
        <Text style={styles.summaryText}>Start: {startDate}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleBookPrivate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Booking...' : 'Confirm Private Booking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: Colors.text,
    fontWeight: '800',
  },
  optionTextActive: {
    color: Colors.white,
  },
  dateButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 3,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
