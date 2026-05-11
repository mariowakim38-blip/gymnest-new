import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Trophy, Calendar, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
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

type DateEditTarget = {
  type: 'class' | 'private';
  id: string;
  currentDate: string;
} | null;

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

const formatDateInputValue = (dateString?: string) => {
  if (!dateString) return '';
  const date = safeDate(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
      const isFinished =
        sorted.length > 0 &&
        sorted.every((b) => b.attended === true || b.attended === false || b.status === 'cancelled');

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
      const isFinished =
        sessions.length > 0 &&
        sessions.every((session: any) => session.attended === true || session.attended === false);

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

const getLatestUnfinishedBundle = (bundles: Bundle[]) =>
  bundles.find((bundle) => !bundle.isFinished) || null;

const calculateProgress = (bundle: Bundle | null): ProgressData => {
  if (!bundle) return emptyProgress;

  const dateKey = bundle.type === 'class' ? 'booking_date' : 'session_date';
  const totalSessions = bundle.items.length;
  const completedSessions = bundle.items.filter((item) => item.attended === true).length;
  const absentSessions = bundle.items.filter((item) => item.attended === false).length;
  const expiredSessions = bundle.items.filter(
    (item) => item.attended !== true && item.attended !== false && isPastSession(item[dateKey])
  ).length;
  const remainingSessions = Math.max(totalSessions - completedSessions - absentSessions - expiredSessions, 0);
  const percentage =
    totalSessions === 0
      ? 0
      : Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

  return { percentage, completedSessions, totalSessions, remainingSessions, absentSessions, expiredSessions };
};

export default function AdminUserProgressScreen() {
  const { childId } = useLocalSearchParams();

  const [child, setChild] = useState<any>(null);
  const [parent, setParent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [privateBookings, setPrivateBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressType, setProgressType] = useState<'class' | 'private'>('class');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('active');
  const [dateEditTarget, setDateEditTarget] = useState<DateEditTarget>(null);
  const [dateDraft, setDateDraft] = useState<string>('');
  const [savingDate, setSavingDate] = useState(false);

  const reloadData = async () => {
    if (!childId) return;
    setLoading(true);

    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .maybeSingle();

    if (childError || !childData) {
      console.error('Admin child progress error:', childError);
      setLoading(false);
      return;
    }

    setChild(childData);

    const { data: parentData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', childData.profile_id)
      .maybeSingle();

    setParent(parentData);

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('child_id', childId)
      .order('booking_date', { ascending: true });

    if (bookingsError) {
      console.error('Admin progress bookings error:', bookingsError);
      setBookings([]);
    } else {
      setBookings(bookingsData ?? []);
    }

    const { data: privateData, error: privateError } = await supabase
      .from('private_bookings')
      .select(`*, private_booking_sessions (*)`)
      .eq('child_id', childId)
      .order('start_date', { ascending: true });

    if (privateError) {
      console.error('Admin private progress error:', privateError);
      setPrivateBookings([]);
    } else {
      setPrivateBookings(privateData ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, [childId]);

  const classBundles = useMemo(() => getClassBundles(bookings), [bookings]);
  const privateBundles = useMemo(() => getPrivateBundles(privateBookings), [privateBookings]);
  const bundles = progressType === 'class' ? classBundles : privateBundles;
  const activeBundle = getLatestUnfinishedBundle(bundles);
  const selectedBundle =
    selectedBundleId === 'active'
      ? activeBundle
      : bundles.find((bundle) => bundle.id === selectedBundleId) || activeBundle;
  const progress = calculateProgress(selectedBundle);

  const openDateEditor = (type: 'class' | 'private', id: string, currentDate?: string) => {
    const cleanDate = formatDateInputValue(currentDate);
    setDateEditTarget({ type, id, currentDate: cleanDate });
    setDateDraft(cleanDate);
  };

  const closeDateEditor = () => {
    setDateEditTarget(null);
    setDateDraft('');
    setSavingDate(false);
  };

  const saveDateEdit = async () => {
    if (!dateEditTarget) return;

    const cleanDate = String(dateDraft || '').trim();

    if (!cleanDate) {
      Alert.alert('Missing date', 'Please choose a date.');
      return;
    }

    setSavingDate(true);

    const table = dateEditTarget.type === 'class' ? 'bookings' : 'private_booking_sessions';
    const column = dateEditTarget.type === 'class' ? 'booking_date' : 'session_date';

    const { error } = await supabase
      .from(table)
      .update({ [column]: cleanDate })
      .eq('id', dateEditTarget.id);

    setSavingDate(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    closeDateEditor();
    await reloadData();
  };

  const setClassAttendance = async (bookingId: string, attended: boolean) => {
    const { error } = await supabase
      .from('bookings')
      .update({ attended, attendance_marked_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    await reloadData();
  };

  const cancelClassSession = async (bookingId: string) => {
    const confirmCancel = typeof window !== 'undefined'
      ? window.confirm('Cancel this class session?')
      : true;

    if (!confirmCancel) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    await reloadData();
  };

  const setPrivateAttendance = async (sessionId: string, attended: boolean) => {
    const { error } = await supabase
      .from('private_booking_sessions')
      .update({ attended, attendance_marked_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    await reloadData();
  };

  const deletePrivateSession = async (sessionId: string) => {
    const confirmDelete = typeof window !== 'undefined'
      ? window.confirm('Delete this private session?')
      : true;

    if (!confirmDelete) return;

    const { error } = await supabase
      .from('private_booking_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    await reloadData();
  };

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.emptyStateText}>Loading progress...</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.emptyState}>
        <Trophy color={Colors.mediumGray} size={64} />
        <Text style={styles.emptyStateTitle}>Student not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.studentHeader}>
          <Text style={styles.studentName}>{child.name}</Text>
          <Text style={styles.studentAge}>{child.age} years old</Text>
          <Text style={styles.studentAge}>Parent: {parent?.name || 'Unknown parent'}</Text>

          <View style={styles.progressToggle}>
            <TouchableOpacity
              style={[styles.progressToggleButton, progressType === 'class' && styles.progressToggleButtonActive]}
              onPress={() => {
                setProgressType('class');
                setSelectedBundleId('active');
              }}
            >
              <Text style={[styles.progressToggleText, progressType === 'class' && styles.progressToggleTextActive]}>Class</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.progressToggleButton, progressType === 'private' && styles.progressToggleButtonActive]}
              onPress={() => {
                setProgressType('private');
                setSelectedBundleId('active');
              }}
            >
              <Text style={[styles.progressToggleText, progressType === 'private' && styles.progressToggleTextActive]}>Private</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: getProgressBarWidth(progress.percentage) }]} />
          </View>
          <Text style={styles.progressSummaryMain}>{progress.completedSessions} / {progress.totalSessions} sessions completed</Text>
          <Text style={styles.progressSummarySub}>{progress.remainingSessions} remaining • {progress.percentage}%</Text>
          <Text style={styles.progressSummarySub}>{selectedBundle ? selectedBundle.label : 'No active bundle. Progress reset to 0.'}</Text>
        </LinearGradient>

        <View style={styles.bundleSelectorBox}>
          <Text style={styles.sectionTitle}>Bundle History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bundleSelectorScroll}>
            <TouchableOpacity
              style={[styles.bundleChip, selectedBundleId === 'active' && styles.bundleChipActive]}
              onPress={() => setSelectedBundleId('active')}
            >
              <Text style={[styles.bundleChipText, selectedBundleId === 'active' && styles.bundleChipTextActive]}>Active</Text>
            </TouchableOpacity>
            {bundles.map((bundle) => (
              <TouchableOpacity
                key={bundle.id}
                style={[styles.bundleChip, selectedBundleId === bundle.id && styles.bundleChipActive]}
                onPress={() => setSelectedBundleId(bundle.id)}
              >
                <Text style={[styles.bundleChipText, selectedBundleId === bundle.id && styles.bundleChipTextActive]}>
                  {bundle.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.usageGrid}>
          <View style={styles.usageCard}><CheckCircle2 color={Colors.success} size={20} /><Text style={styles.usageNumber}>{progress.completedSessions}</Text><Text style={styles.usageLabel}>Present</Text></View>
          <View style={styles.usageCard}><Calendar color={Colors.primary} size={20} /><Text style={styles.usageNumber}>{progress.remainingSessions}</Text><Text style={styles.usageLabel}>Remaining</Text></View>
          <View style={styles.usageCard}><AlertCircle color={Colors.danger} size={20} /><Text style={styles.usageNumber}>{progress.absentSessions}</Text><Text style={styles.usageLabel}>Absent</Text></View>
        </View>

        <View style={styles.sectionContent}>
          <View style={styles.sectionHeader}><Clock color={Colors.primary} size={20} /><Text style={styles.sectionTitle}>Selected Bundle Sessions</Text></View>
          {!selectedBundle ? (
            <Text style={styles.noDataText}>No active sessions. Old bundles are in history.</Text>
          ) : selectedBundle.items.map((item: any) => {
            const isPrivate = selectedBundle.type === 'private';
            const date = isPrivate ? item.session_date : item.booking_date;
            const status = item.attended === true ? 'Present' : item.attended === false ? 'Absent' : isPastSession(date) ? 'Not marked' : 'Upcoming';
            return (
              <View key={item.id} style={styles.sessionHistoryItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classItemName}>{formatDisplayDate(date)}</Text>
                  <Text style={styles.classItemTime}>{status}</Text>
                </View>
                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={[styles.sessionActionButton, styles.editActionButton]}
                    onPress={() => openDateEditor(isPrivate ? 'private' : 'class', item.id, date)}
                  ><Text style={styles.sessionActionText}>Edit Date</Text></TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sessionActionButton, styles.presentActionButton]}
                    onPress={() => isPrivate ? setPrivateAttendance(item.id, true) : setClassAttendance(item.id, true)}
                  ><Text style={styles.sessionActionText}>Present</Text></TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sessionActionButton, styles.absentActionButton]}
                    onPress={() => isPrivate ? setPrivateAttendance(item.id, false) : setClassAttendance(item.id, false)}
                  ><Text style={styles.sessionActionText}>Absent</Text></TouchableOpacity>
                  {!isPrivate && (
                    <TouchableOpacity
                      style={[styles.sessionActionButton, styles.cancelActionButton]}
                      onPress={() => cancelClassSession(item.id)}
                    ><Text style={styles.sessionActionText}>Cancel</Text></TouchableOpacity>
                  )}
                  {isPrivate && (
                    <TouchableOpacity
                      style={[styles.sessionActionButton, styles.deleteActionButton]}
                      onPress={() => deletePrivateSession(item.id)}
                    ><Text style={styles.sessionActionText}>Delete</Text></TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={!!dateEditTarget}
        transparent
        animationType="fade"
        onRequestClose={closeDateEditor}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModal}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Edit Session Date</Text>
              <TouchableOpacity onPress={closeDateEditor} style={styles.closeButton}>
                <X color={Colors.text} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.dateModalLabel}>Choose the new session date</Text>

            <input
              type="date"
              value={dateDraft}
              onChange={(e) => setDateDraft(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                fontSize: 16,
                marginTop: 10,
                marginBottom: 18,
              }}
            />

            <View style={styles.dateModalActions}>
              <TouchableOpacity
                style={[styles.dateModalButton, styles.dateCancelButton]}
                onPress={closeDateEditor}
                disabled={savingDate}
              >
                <Text style={styles.dateCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateModalButton, styles.dateSaveButton]}
                onPress={saveDateEdit}
                disabled={savingDate}
              >
                <Text style={styles.dateSaveButtonText}>{savingDate ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyStateTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 12 },
  emptyStateText: { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
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
  bundleSelectorBox: { backgroundColor: Colors.white, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  bundleSelectorScroll: { gap: 8, paddingTop: 8 },
  bundleChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#E8ECF2' },
  bundleChipActive: { backgroundColor: Colors.primary },
  bundleChipText: { color: Colors.textLight, fontWeight: '900', fontSize: 12 },
  bundleChipTextActive: { color: Colors.white },
  usageGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  usageCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  usageNumber: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 6 },
  usageLabel: { fontSize: 12, color: Colors.textLight, fontWeight: '800', marginTop: 2 },
  sectionContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  noDataText: { color: Colors.textLight, fontWeight: '700' },
  sessionHistoryItem: { flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  classItemName: { color: Colors.text, fontSize: 15, fontWeight: '900' },
  classItemTime: { color: Colors.textLight, fontSize: 13, fontWeight: '700', marginTop: 4 },
  sessionActions: { gap: 6, alignItems: 'flex-end' },
  sessionActionButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  editActionButton: { backgroundColor: Colors.primary },
  presentActionButton: { backgroundColor: Colors.success },
  absentActionButton: { backgroundColor: Colors.warning },
  cancelActionButton: { backgroundColor: Colors.danger },
  deleteActionButton: { backgroundColor: Colors.danger },
  sessionActionText: { color: Colors.white, fontWeight: '900', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  dateModal: { width: '100%', maxWidth: 520, backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  dateModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dateModalTitle: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  dateModalLabel: { color: Colors.textLight, fontSize: 14, fontWeight: '800' },
  dateModalActions: { flexDirection: 'row', gap: 10 },
  dateModalButton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  dateCancelButton: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' },
  dateSaveButton: { backgroundColor: Colors.primary },
  dateCancelButtonText: { color: Colors.text, fontWeight: '900' },
  dateSaveButtonText: { color: Colors.white, fontWeight: '900' },
});
