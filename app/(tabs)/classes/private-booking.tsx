import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';

export default function PrivateBookingScreen() {
  const [hours, setHours] = useState<number | null>(null);
  const [day, setDay] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleBook = async () => {
    if (!hours || !day || !startDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const totalSessions = hours; // 1h = 1 session (you can change later)

      const { error } = await supabase.from('private_bookings').insert({
        user_id: user.id,
        total_sessions: totalSessions,
        remaining_sessions: totalSessions,
        preferred_day: day,
        start_date: startDate,
        notes,
        status: 'active',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Success', 'Private sessions booked successfully');

      // reset
      setHours(null);
      setDay('');
      setStartDate('');
      setNotes('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Private Sessions</Text>

      {/* HOURS */}
      <Text style={styles.label}>Select Package</Text>
      <View style={styles.row}>
        {[4, 8, 16].map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.option, hours === h && styles.optionActive]}
            onPress={() => setHours(h)}
          >
            <Text style={styles.optionText}>{h} Hours</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DAY */}
      <Text style={styles.label}>Select Day</Text>
      <View style={styles.rowWrap}>
        {days.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.option, day === d && styles.optionActive]}
            onPress={() => setDay(d)}
          >
            <Text style={styles.optionText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* START DATE */}
      <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
      <TextInput
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-05-10"
        style={styles.input}
      />

      {/* NOTES */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Any details..."
        style={styles.input}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleBook}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Booking...' : 'Confirm Booking'}
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
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 20,
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    color: Colors.text,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  optionActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: '#111',
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: Colors.primary,
    marginTop: 25,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
});
