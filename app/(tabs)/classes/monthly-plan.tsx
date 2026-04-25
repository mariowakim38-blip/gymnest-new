// FULL PREMIUM MONTHLY BUILDER WITH CALENDAR

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

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const timeSlots = [
  { time: '4:30 PM', level: 'Beginner' },
  { time: '5:30 PM', level: 'Intermediate/Advanced' },
  { time: '6:30 PM', level: 'Intermediate/Advanced' },
  { time: '7:30 PM', level: 'Intermediate/Advanced' },
];

export default function MonthlyPlan() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*');
      setClasses(data ?? []);
    };
    fetchClasses();
  }, []);

  const weeklyHours = selectedPackage ? selectedPackage / 4 : 0;

  const isSlotSelected = (day: string, time: string) =>
    selectedSlots.some((s) => s.day === day && s.time === time);

  const handleSelectSlot = (day: string, slot: any) => {
    const exists = isSlotSelected(day, slot.time);

    if (slot.level === 'Beginner') {
      const alreadySelectedSameDay = selectedSlots.some((s) => s.day === day);
      if (alreadySelectedSameDay && !exists) {
        Alert.alert('Rule', 'Beginner only 1 hour/day');
        return;
      }
    }

    let updated = [...selectedSlots];

    if (exists) {
      updated = updated.filter((s) => !(s.day === day && s.time === slot.time));
    } else {
      updated.push({ day, ...slot });
    }

    if (updated.length > weeklyHours) {
      Alert.alert('Limit', `Max ${weeklyHours} hours/week`);
      return;
    }

    setSelectedSlots(updated);
  };

  // 🔥 NEW DATE GENERATOR BASED ON SELECTED START DATE
  const generateDates = (day: string, weeks = 4) => {
    const dayMap: any = {
      Sunday: 0, Monday: 1, Tuesday: 2,
      Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
    };

    const start = new Date(startDate);
    const targetDay = dayMap[day];

    let diff = targetDay - start.getDay();
    if (diff < 0) diff += 7;

    const firstDate = new Date(start);
    firstDate.setDate(start.getDate() + diff);

    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date(firstDate);
      d.setDate(firstDate.getDate() + i * 7);
      return d.toISOString().split('T')[0];
    });
  };

  const handleConfirm = async () => {
    const student = user?.children?.[0];

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

    await supabase.from('bookings').insert(allBookings);

    Alert.alert('Success', 'Schedule created');
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <Text style={styles.title}>Choose Package</Text>

          <View style={styles.packages}>
            {packages.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.package,
                  selectedPackage === p && styles.active,
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
                Select {weeklyHours} hours/week
              </Text>

              {days.map((day) => (
                <View key={day}>
                  <Text style={styles.day}>{day}</Text>

                  <View style={styles.row}>
                    {timeSlots.map((slot) => {
                      const selected = isSlotSelected(day, slot.time);
                      return (
                        <TouchableOpacity
                          key={slot.time}
                          style={[
                            styles.slot,
                            selected && styles.active,
                          ]}
                          onPress={() => handleSelectSlot(day, slot)}
                        >
                          <Text>{slot.time}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.next}
                onPress={() => setStep(2)}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <Text style={styles.title}>Choose Start Date</Text>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => {
              const next = new Date(startDate);
              next.setDate(startDate.getDate() + 1);
              setStartDate(next);
            }}
          >
            <Text style={styles.dateText}>
              {startDate.toDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },

  subtitle: { marginVertical: 10 },

  packages: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  package: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  active: {
    backgroundColor: Colors.primary,
  },

  packageText: { fontWeight: 'bold' },

  day: { marginTop: 10, fontWeight: 'bold' },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  slot: {
    padding: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
  },

  next: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
  },

  nextText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  dateBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 12,
  },

  dateText: { textAlign: 'center', fontSize: 16 },

  confirm: {
    marginTop: 30,
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 10,
  },

  confirmText: { textAlign: 'center', fontWeight: 'bold' },
});
