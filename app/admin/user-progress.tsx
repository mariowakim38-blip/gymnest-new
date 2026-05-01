import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function AdminUserProgress() {
  const { childId } = useLocalSearchParams();

  const [child, setChild] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) return;

      setLoading(true);

      // child
      const { data: childData } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      setChild(childData);

      // bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('child_id', childId);

      setBookings(bookingsData || []);

      // attendance
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('child_id', childId)
        .eq('status', 'present');

      setAttendance(attendanceData || []);

      setLoading(false);
    };

    fetchData();
  }, [childId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const total = bookings.length;
  const completed = attendance.length;

  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{child?.name}</Text>

      <Text>Total Sessions: {total}</Text>
      <Text>Completed: {completed}</Text>
      <Text>Progress: {percentage}%</Text>

      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  bar: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
});
