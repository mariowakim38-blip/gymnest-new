import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const packages = [4, 8, 12, 16, 20, 24, 28, 32];

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const timeSlots = [
  { time: '4:30 PM', level: 'Beginner' },
  { time: '5:30 PM', level: 'Intermediate/Advanced' },
  { time: '6:30 PM', level: 'Intermediate/Advanced' },
  { time: '7:30 PM', level: 'Intermediate/Advanced' },
];

export default function MonthlyPlan() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*');
      setClasses(data ?? []);
    };

    fetchClasses();
  }, []);

  const weeklyHours = selectedPackage ? selectedPackage / 4 : 0;

  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some((s) => s.day === day && s.time === time);
  };

  const handleSelectSlot = (day: string, slot: any) => {
    const exists = isSlotSelected(day, slot.time);

    // ❌ Beginner rule
    if (slot.level === 'Beginner') {
      const alreadySelectedSameDay = selectedSlots.some(
        (s) => s.day === day
      );

      if (alreadySelectedSameDay && !exists) {
        Alert.alert('Beginner rule', 'Only 1 hour per day allowed for Beginner');
        return;
      }
    }

    let updated = [...selectedSlots];

    if (exists) {
      updated = updated.filter(
        (s) => !(s.day === day && s.time === slot.time)
      );
    } else {
      updated.push({ day, ...slot });
    }

    if (updated.length > weeklyHours) {
      Alert.alert('Limit reached', `You can select only ${weeklyHours} hours per week`);
      return;
    }

    setSelectedSlots(updated);
  };

  const generateDates = (day: string, weeks = 4) => {
    const dayMap: any = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const today = new Date();
    const targetDay = dayMap[day];
    let diff = targetDay - today.getDay();
    if (diff < 0) diff += 7;

    const firstDate = new Date(today);
    firstDate.setDate(today.getDate() + diff);

    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(firstDate);
      d.setDate(firstDate.getDate() + i * 7);
      return d.toISOString().split('T')[0];
    });
  };

  const handleConfirm = async () => {
    if (!selectedPackage || selectedSlots.length === 0) {
      Alert.alert('Error', 'Select package and schedule');
      return;
    }

    const student = user?.children?.[0];

    if (!student) {
      Alert.alert('Error', 'No student found');
      return;
    }

    const allBookings: any[] = [];

    for (const slot of selectedSlots) {
      const classMatch = classes.find(
        (c) => c.day === slot.day && c.time === slot.time
      );

      if (!classMatch) continue;

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
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'Monthly schedule created');
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose Package</Text>

      <View style={styles.packages}>
        {packages.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.package,
              selectedPackage === p && styles.packageActive,
            ]}
            onPress={() => {
              setSelectedPackage(p);
              setSelectedSlots([]);
            }}
          >
            <Text style={styles.packageText}>{p}h/month</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPackage && (
        <>
          <Text style={styles.subtitle}>
            Select {weeklyHours} hours per week
          </Text>

          {days.map((day) => (
            <View key={day} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>{day}</Text>

              <View style={styles.slots}>
                {timeSlots.map((slot) => {
                  const selected = isSlotSelected(day, slot.time);

                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.slot,
                        selected && styles.slotSelected,
                      ]}
                      onPress={() => handleSelectSlot(day, slot)}
                    >
                      <Text style={styles.slotText}>
                        {slot.time}
                      </Text>
                      <Text style={styles.level}>
                        {slot.level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Schedule</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { marginVertical: 10, fontWeight: '600' },

  packages: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  package: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
  },

  packageActive: {
    backgroundColor: Colors.primary,
  },

  packageText: { fontWeight: 'bold', color: '#000' },

  dayBlock: { marginTop: 15 },

  dayTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },

  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  slot: {
    padding: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
  },

  slotSelected: {
    backgroundColor: Colors.primary,
  },

  slotText: { fontWeight: 'bold' },

  level: { fontSize: 12 },

  confirm: {
    marginTop: 30,
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 10,
  },

  confirmText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
