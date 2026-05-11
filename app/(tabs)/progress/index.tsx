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
import { Trophy, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type Bundle = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  type: 'class' | 'private';
  items: any[];
  isFinished: boolean;
};

type ProgressData = {
  percentage: number;
  completedSessions: number;
  totalSessions: number;
  remainingSessions: number;
  absentSessions: number;
  expiredSessions: number;
};

const emptyProgress: ProgressData = {
  percentage: 0,
  completedSessions: 0,
  totalSessions: 0,
  remainingSessions: 0,
  absentSessions: 0,
  expiredSessions: 0,
};

const safeDate = (dateString?: string) => {
  if (!dateString) return new Date();
  return new Date(`${dateString}T12:00:00`);
};

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return 'No date';
  return safeDate(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isPastSession = (dateString?: string) => {
  if (!dateString) return false;
  const sessionDate = safeDate(dateString);
  const today = new Date();
  sessionDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return sessionDate.getTime() < today.getTime();
};

const getProgressBarWidth = (percentage: number) =>
  `${Math.min(Math.max(percentage, 0), 100)}%` as `${number}%`;

const getClassBundleKey = (booking: any) => {
  if (booking.created_at) return String(booking.created_at).slice(0, 16);
  return `${booking.profile_id || ''}-${booking.child_id || ''}-${String(booking.booking_date || '').slice(0, 7)}`;
};

const getClassBundles = (bookings: any[]): Bundle[] => {
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const grouped = activeBookings.reduce((acc: Record<string, any[]>, booking) => {
    const key = getClassBundleKey(booking);
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([key, items]) => {
      const sorted = [...items].sort(
        (a, b) => safeDate(a.booking_date).getTime() - safeDate(b.booking_date).getTime()
      );
      const startDate = sorted[0]?.booking_date;
      const endDate = sorted[sorted.length - 1]?.booking_date;
      const isFinished = sorted.length > 0 && sorted.every((b) => b.attended === true || b.attended === false || b.status === 'cancelled');

      return {
        id: key,
        label: `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
        startDate,
        endDate,
        type: 'class' as const,
        items: sorted,
        isFinished,
      };
    })
    .sort((a, b) => safeDate(b.startDate).getTime() - safeDate(a.startDate).getTime());
};

const getPrivateBundles = (privateBookings: any[]): Bundle[] => {
  return privateBookings
    .filter((booking) => booking.status !== 'cancelled')
    .map((booking) => {
      const sessions = [...(booking.private_booking_sessions || [])].sort(
        (a, b) => safeDate(a.session_date).getTime() - safeDate(b.session_date).getTime()
      );
      const startDate = sessions[0]?.session_date || booking.start_date;
      const endDate = sessions[sessions.length - 1]?.session_date || booking.start_date;
      const isFinished = sessions.length > 0 && sessions.every((session: any) => session.attended === true || session.attended === false);

      return {
        id: String(booking.id),
        label: `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
        startDate,
        endDate,
        type: 'private' as const,
        items: sessions.map((session: any) => ({ ...session, booking })),
        isFinished,
      };
    })
    .sort((a, b) => safeDate(b.startDate).getTime() - safeDate(a.startDate).getTime());
};

const getLatestUnfinishedBundle = (bundles: Bundle[]) => {
  return bundles.find((bundle) => !bundle.isFinished) || null;
};

const calculateClassProgress = (bundle: Bundle | null): ProgressData => {
  if (!bundle) return emptyProgress;

  const totalSessions = bundle.items.length;
  const completedSessions = bundle.items.filter((b) => b.attended === true).length;
  const absentSessions = bundle.items.filter((b) => b.attended === false).length;
  const expiredSessions = bundle.items.filter(
    (b) => b.attended !== true && b.attended !== false && isPastSession(b.booking_date)
  ).length;
  const remainingSessions = Math.max(totalSessions - completedSessions - absentSessions - expiredSessions, 0);
  const percentage = totalSessions === 0 ? 0 : Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

  return { percentage, completedSessions, totalSessions, remainingSessions, absentSessions, expiredSessions };
};

const calculatePrivateProgress = (bundle: Bundle | null): ProgressData => {
  if (!bundle) return emptyProgress;

  const totalSessions = bundle.items.length;
  const completedSessions = bundle.items.filter((s) => s.attended === true).length;
  const absentSessions = bundle.items.filter((s) => s.attended === false).length;
  const expiredSessions = bundle.items.filter(
    (s) => s.attended !== true && s.attended !== false && isPastSession(s.session_date)
  ).length;
  const remainingSessions = Math.max(totalSessions - completedSessions - absentSessions - expiredSessions, 0);
  const percentage = totalSessions === 0 ? 0 : Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

  return { percentage, completedSessions, totalSessions, remainingSessions, absentSessions, expiredSessions };
};

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [privateBookings, setPrivateBookings] = useState<any[]>([]);
  const [progressType, setProgressType] = useState<'class' | 'private'>('class');
  const [loading, setLoading] = useState(false);

  const children = user?.children || [];

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!isAuthenticated || !user || children.length === 0) return;

      setLoading(true);
      const childIds = children.map((child: any) => child.id);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('child_id', childIds)
        .order('booking_date', { ascending: true });

      if (bookingsError) {
        console.error('Progress bookings error:', bookingsError);
        setBookings([]);
      } else {
        setBookings(bookingsData ?? []);
      }

      const { data: privateData, error: privateError } = await supabase
        .from('private_bookings')
        .select(`*, private_booking_sessions (*)`)
        .in('child_id', childIds)
        .order('start_date', { ascending: true });

      if (privateError) {
        console.error('Private progress error:', privateError);
        setPrivateBookings([]);
      } else {
        setPrivateBookings(privateData ?? []);
      }

      setLoading(false);
    };

    fetchProgressData();
  }, [isAuthenticated, user?.id, children.length]);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Trophy color={Colors.mediumGray} size={64} />
          <Text style={styles.emptyStateTitle}>Login Required</Text>
          <Text style={styles.emptyStateText}>Please log in to view student progress</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login' as Href)}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {children.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy color={Colors.mediumGray} size={64} />
          <Text style={styles.emptyStateTitle}>No Students Added</Text>
          <Text style={styles.emptyStateText}>Add your children to track their progress</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyStateText}>Loading progress...</Text>
        </View>
      ) : (
        children.map((child: any) => {
          const childBookings = bookings.filter((b) => String(b.child_id) === String(child.id));
          const childPrivateBookings = privateBookings.filter((b) => String(b.child_id) === String(child.id));

          const classBundles = getClassBundles(childBookings);
          const privateBundles = getPrivateBundles(childPrivateBookings);
          const activeClassBundle = getLatestUnfinishedBundle(classBundles);
          const activePrivateBundle = getLatestUnfinishedBundle(privateBundles);

          const classProgress = calculateClassProgress(activeClassBundle);
          const privateProgress = calculatePrivateProgress(activePrivateBundle);
          const activeProgress = progressType === 'class' ? classProgress : privateProgress;
          const activeBundle = progressType === 'class' ? activeClassBundle : activePrivateBundle;
          const historyBundles = progressType === 'class' ? classBundles : privateBundles;

          return (
            <View key={child.id} style={styles.studentSection}>
              <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.studentHeader}>
                <Text style={styles.studentName}>{child.name}</Text>
                <Text style={styles.studentAge}>{child.age} years old</Text>

                <View style={styles.progressToggle}>
                  <TouchableOpacity
                    style={[styles.progressToggleButton, progressType === 'class' && styles.progressToggleButtonActive]}
                    onPress={() => setProgressType('class')}
                  >
                    <Text style={[styles.progressToggleText, progressType === 'class' && styles.progressToggleTextActive]}>Class</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.progressToggleButton, progressType === 'private' && styles.progressToggleButtonActive]}
                    onPress={() => setProgressType('private')}
                  >
                    <Text style={[styles.progressToggleText, progressType === 'private' && styles.progressToggleTextActive]}>Private</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: getProgressBarWidth(activeProgress.percentage) }]} />
                </View>

                <Text style={styles.progressSummaryMain}>
                  {activeProgress.completedSessions} / {activeProgress.totalSessions} sessions completed
                </Text>
                <Text style={styles.progressSummarySub}>
                  {activeProgress.remainingSessions} remaining
                  {activeProgress.absentSessions > 0 ? ` • ${activeProgress.absentSessions} absent` : ''}
                  {activeProgress.expiredSessions > 0 ? ` • ${activeProgress.expiredSessions} not marked` : ''}
                </Text>
                <Text style={styles.progressSummarySub}>
                  {activeBundle ? `Active bundle: ${activeBundle.label}` : 'No active bundle. Progress reset to 0.'}
                </Text>
              </LinearGradient>

              <View style={styles.usageGrid}>
                <View style={styles.usageCard}>
                  <CheckCircle2 color={Colors.success} size={20} />
                  <Text style={styles.usageNumber}>{activeProgress.completedSessions}</Text>
                  <Text style={styles.usageLabel}>Present</Text>
                </View>
                <View style={styles.usageCard}>
                  <Calendar color={Colors.primary} size={20} />
                  <Text style={styles.usageNumber}>{activeProgress.remainingSessions}</Text>
                  <Text style={styles.usageLabel}>Remaining</Text>
                </View>
                <View style={styles.usageCard}>
                  <AlertCircle color={Colors.danger} size={20} />
                  <Text style={styles.usageNumber}>{activeProgress.absentSessions}</Text>
                  <Text style={styles.usageLabel}>Absent</Text>
                </View>
              </View>

              <View style={styles.sectionContent}>
                <View style={styles.sectionHeader}>
                  <Clock color={Colors.primary} size={20} />
                  <Text style={styles.sectionTitle}>Bundle History</Text>
                </View>
                {historyBundles.length === 0 ? (
                  <Text style={styles.noDataText}>No bundles yet</Text>
                ) : (
                  historyBundles.map((bundle) => {
                    const progress = progressType === 'class' ? calculateClassProgress(bundle) : calculatePrivateProgress(bundle);
                    return (
                      <View key={bundle.id} style={styles.historyItem}>
                        <Text style={styles.historyTitle}>{bundle.label}</Text>
                        <Text style={styles.historyText}>
                          {progress.completedSessions}/{progress.totalSessions} present • {progress.remainingSessions} remaining
                        </Text>
                        <Text style={[styles.historyStatus, bundle.isFinished ? styles.finishedText : styles.activeText]}>
                          {bundle.isFinished ? 'Finished / History' : 'Active'}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyStateTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 12 },
  emptyStateText: { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
  loginButton: { backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginTop: 16 },
  loginButtonText: { color: Colors.white, fontWeight: '900' },
  studentSection: { marginBottom: 24 },
  studentHeader: { borderRadius: 24, padding: 22, marginBottom: 16 },
  studentName: { color: Colors.white, fontSize: 26, fontWeight: '900' },
  studentAge: { color: '#EAF4FF', fontSize: 14, marginTop: 4, fontWeight: '700' },
  progressToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: 4, marginTop: 18, gap: 4 },
  progressToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  progressToggleButtonActive: { backgroundColor: Colors.white },
  progressToggleText: { color: Colors.white, fontWeight: '900' },
  progressToggleTextActive: { color: Colors.primary },
  progressBarTrack: { height: 12, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 999, overflow: 'hidden', marginTop: 18 },
  progressBarFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 999 },
  progressSummaryMain: { color: Colors.white, fontSize: 16, fontWeight: '900', marginTop: 12 },
  progressSummarySub: { color: '#EAF4FF', fontSize: 13, fontWeight: '700', marginTop: 4 },
  usageGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  usageCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  usageNumber: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 6 },
  usageLabel: { fontSize: 12, color: Colors.textLight, fontWeight: '800', marginTop: 2 },
  sectionContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  noDataText: { color: Colors.textLight, fontWeight: '700' },
  historyItem: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  historyTitle: { color: Colors.text, fontSize: 15, fontWeight: '900' },
  historyText: { color: Colors.textLight, fontSize: 13, fontWeight: '700', marginTop: 4 },
  historyStatus: { fontSize: 12, fontWeight: '900', marginTop: 6 },
  finishedText: { color: Colors.textLight },
  activeText: { color: Colors.success },
});
