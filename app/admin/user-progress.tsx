import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Trophy, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';

type ProgressData = {
  percentage: number;
  completedSessions: number;
  totalSessions: number;
  remainingSessions: number;
  expiredSessions: number;
  makeupSessions: number;
  usableSessions: number;
};

export default function AdminUserProgressScreen() {
  const { childId } = useLocalSearchParams();

  const [child, setChild] = useState<any>(null);
  const [parent, setParent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [progressType, setProgressType] = useState<'class' | 'private'>('class');
  const [privateBookings, setPrivateBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchProgressData = async () => {
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
        setLoading(false);
        return;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('child_id', childId)
        .order('attended_date', { ascending: true });

      if (attendanceError) {
        console.error('Admin progress attendance error:', attendanceError);
        setAttendanceRecords([]);
      } else {
        setAttendanceRecords(attendanceData ?? []);
      }

      const { data: privateData, error: privateError } = await supabase
        .from('private_bookings')
        .select(`
          *,
          private_booking_sessions (*)
        `)
        .eq('child_id', childId);

      if (privateError) {
        console.error('Admin private progress error:', privateError);
        setPrivateBookings([]);
      } else {
        setPrivateBookings(privateData ?? []);
      }

      const classIds = Array.from(
        new Set((bookingsData ?? []).map((booking: any) => String(booking.class_id)))
      );

      const attendedClassIds = Array.from(
        new Set(
          (attendanceData ?? [])
            .map((record: any) => String(record.attended_class_id))
            .filter(Boolean)
        )
      );

      const allClassIds = Array.from(new Set([...classIds, ...attendedClassIds]));
      const classMap: Record<string, any> = {};

      if (allClassIds.length > 0) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, age_group, day, time, duration, level');

        if (classesError) {
          console.error('Admin progress classes error:', classesError);
        } else {
          (classesData ?? []).forEach((cls: any) => {
            classMap[String(cls.id)] = cls;
          });
        }
      }

      setBookings(bookingsData ?? []);
      setClassesMap(classMap);
      setLoading(false);
    };

    fetchProgressData();
  }, [childId]);

  const safeDate = (dateString: string) => {
    if (!dateString) return new Date();
    return new Date(`${dateString}T12:00:00`);
  };

  const isPastSession = (dateString: string) => {
    if (!dateString) return false;

    const sessionDate = safeDate(dateString);
    const today = new Date();

    sessionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return sessionDate.getTime() < today.getTime();
  };

  const presentAttendanceRecords = attendanceRecords.filter(
    (record) => record.status === 'present'
  );

  const getEnrolledClasses = () => {
    const map = new Map<string, any>();

    bookings.forEach((booking) => {
      const cls = classesMap[String(booking.class_id)];

      if (cls) {
        map.set(String(cls.id), {
          id: cls.id,
          name: cls.name,
          ageGroup: cls.age_group,
          day: cls.day,
          time: cls.time,
          duration: cls.duration,
          level: cls.level,
          source: 'booking',
        });
      }
    });

    presentAttendanceRecords.forEach((record) => {
      const cls = classesMap[String(record.attended_class_id)];

      if (cls && !map.has(String(cls.id))) {
        map.set(String(cls.id), {
          id: cls.id,
          name: cls.name,
          ageGroup: cls.age_group,
          day: cls.day,
          time: cls.time,
          duration: cls.duration,
          level: cls.level,
          source: 'makeup',
        });
      }
    });

    return Array.from(map.values());
  };

  const getProgressData = (): ProgressData => {
    const activeBookings = bookings.filter(
      (booking) => booking.status !== 'cancelled'
    );

    const totalSessions = activeBookings.length;

    const regularCompleted = activeBookings.filter(
      (booking) => booking.attended === true
    ).length;

    const makeupSessions = presentAttendanceRecords.filter(
      (record) =>
        record.attendance_type === 'makeup' ||
        record.attendance_type === 'manual'
    ).length;

    const completedSessions = regularCompleted + makeupSessions;

    const expiredSessions = activeBookings.filter(
      (booking) =>
        booking.attended !== true &&
        booking.status !== 'cancelled' &&
        isPastSession(booking.booking_date)
    ).length;

    const remainingSessions = Math.max(
      totalSessions - completedSessions - expiredSessions,
      0
    );

    const usableSessions = Math.max(totalSessions - expiredSessions, 0);

    const percentage =
      totalSessions === 0
        ? 0
        : Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

    return {
      percentage,
      completedSessions,
      totalSessions,
      remainingSessions,
      expiredSessions,
      makeupSessions,
      usableSessions,
    };
  };

  const getPrivateProgressData = () => {
    const allSessions = privateBookings.flatMap((booking: any) =>
      (booking.private_booking_sessions || []).map((session: any) => ({
        ...session,
        booking,
      }))
    );

    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter((session: any) => session.attended === true).length;
    const absentSessions = allSessions.filter((session: any) => session.attended === false).length;
    const unmarkedSessions = allSessions.filter((session: any) => session.attended === null || session.attended === undefined).length;
    const upcomingSessions = allSessions.filter((session: any) =>
      (session.attended === null || session.attended === undefined) && !isPastSession(session.session_date)
    ).length;
    const remainingSessions = Math.max(totalSessions - completedSessions - absentSessions, 0);
    const percentage =
      totalSessions === 0
        ? 0
        : Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

    return {
      percentage,
      completedSessions,
      totalSessions,
      remainingSessions,
      absentSessions,
      unmarkedSessions,
      upcomingSessions,
      packagesCount: privateBookings.length,
      sessions: allSessions.sort((a: any, b: any) =>
        safeDate(a.session_date).getTime() - safeDate(b.session_date).getTime()
      ),
    };
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return safeDate(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPrivateSessionStatus = (session: any) => {
    if (session.attended === true) return 'Present';
    if (session.attended === false) return 'Absent';
    return isPastSession(session.session_date) ? 'Not marked' : 'Upcoming';
  };

  const getProgressBarWidth = (percentage: number) => {
    return `${Math.min(Math.max(percentage, 0), 100)}%` as `${number}%`;
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

  const classProgress = getProgressData();
  const privateProgress = getPrivateProgressData();
  const enrolledClasses = getEnrolledClasses();
  const activeProgress = progressType === 'class' ? classProgress : privateProgress;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.studentSection}>
        <LinearGradient
          colors={[Colors.primary, '#2a3f5f']}
          style={styles.studentHeader}
        >
          <View style={styles.studentHeaderContent}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {String(child.name || '?').charAt(0)}
              </Text>
            </View>

            <View style={styles.studentHeaderInfo}>
              <Text style={styles.studentName}>{child.name}</Text>
              <Text style={styles.studentAge}>{child.age} years old</Text>
              <Text style={styles.studentAge}>Parent: {parent?.name || 'Unknown parent'}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progressType === 'class' ? enrolledClasses.length : privateProgress.packagesCount}</Text>
              <Text style={styles.statLabel}>{progressType === 'class' ? 'Classes' : 'Private packages'}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeProgress.percentage}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          <View style={styles.progressSummary}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: getProgressBarWidth(activeProgress.percentage) },
                ]}
              />
            </View>

            <Text style={styles.progressSummaryMain}>
              {activeProgress.completedSessions} / {activeProgress.totalSessions} sessions completed
            </Text>

            <Text style={styles.progressSummarySub}>
              {activeProgress.remainingSessions} remaining
              {progressType === 'class' && classProgress.expiredSessions > 0 ? ` • ${classProgress.expiredSessions} expired` : ''}
              {progressType === 'class' && classProgress.makeupSessions > 0 ? ` • ${classProgress.makeupSessions} make-up used` : ''}
              {progressType === 'private' && privateProgress.absentSessions > 0 ? ` • ${privateProgress.absentSessions} absent` : ''}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.progressToggle}>
          <TouchableOpacity
            style={[styles.progressToggleButton, progressType === 'class' && styles.progressToggleButtonActive]}
            onPress={() => setProgressType('class')}
            activeOpacity={0.85}
          >
            <Text style={[styles.progressToggleText, progressType === 'class' && styles.progressToggleTextActive]}>
              Class Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.progressToggleButton, progressType === 'private' && styles.progressToggleButtonActive]}
            onPress={() => setProgressType('private')}
            activeOpacity={0.85}
          >
            <Text style={[styles.progressToggleText, progressType === 'private' && styles.progressToggleTextActive]}>
              Private Progress
            </Text>
          </TouchableOpacity>
        </View>

        {progressType === 'class' && (
        <View style={styles.sectionContent}>
          <View style={styles.sectionHeader}>
            <Calendar color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Enrolled Classes</Text>
          </View>

          {enrolledClasses.length === 0 ? (
            <Text style={styles.noDataText}>No classes enrolled yet</Text>
          ) : (
            enrolledClasses.map((cls: any) => (
              <View key={cls.id} style={styles.classItem}>
                <View style={styles.classItemLeft}>
                  <Text style={styles.classItemName}>{cls.name}</Text>
                  <Text style={styles.classItemTime}>
                    {cls.day}, {cls.time} ({cls.duration})
                  </Text>
                  <Text style={styles.classItemLevel}>
                    {cls.level} • {cls.ageGroup}
                  </Text>
                </View>

                <View style={styles.progressBadge}>
                  <TrendingUp color={Colors.success} size={16} />
                </View>
              </View>
            ))
          )}
        </View>
        )}

        {progressType === 'class' && (
        <View style={styles.sectionContent}>
          <View style={styles.sectionHeader}>
            <Clock color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Session Usage</Text>
          </View>

          <View style={styles.usageGrid}>
            <View style={styles.usageCard}>
              <CheckCircle2 color={Colors.success} size={20} />
              <Text style={styles.usageNumber}>{classProgress.completedSessions}</Text>
              <Text style={styles.usageLabel}>Completed</Text>
            </View>

            <View style={styles.usageCard}>
              <Calendar color={Colors.primary} size={20} />
              <Text style={styles.usageNumber}>{classProgress.remainingSessions}</Text>
              <Text style={styles.usageLabel}>Remaining</Text>
            </View>

            <View style={styles.usageCard}>
              <AlertCircle color={Colors.danger} size={20} />
              <Text style={styles.usageNumber}>{classProgress.expiredSessions}</Text>
              <Text style={styles.usageLabel}>Expired</Text>
            </View>
          </View>

          {classProgress.makeupSessions > 0 && (
            <View style={styles.makeupNotice}>
              <Text style={styles.makeupNoticeTitle}>Make-up sessions included</Text>
              <Text style={styles.makeupNoticeText}>
                {classProgress.makeupSessions} make-up/manual attendance record
                {classProgress.makeupSessions === 1 ? '' : 's'} deducted from total usage.
              </Text>
            </View>
          )}
        </View>
        )}

        {progressType === 'private' && (
          <>
            <View style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <Clock color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>Private Session Usage</Text>
              </View>

              <View style={styles.usageGrid}>
                <View style={styles.usageCard}>
                  <CheckCircle2 color={Colors.success} size={20} />
                  <Text style={styles.usageNumber}>{privateProgress.completedSessions}</Text>
                  <Text style={styles.usageLabel}>Present</Text>
                </View>

                <View style={styles.usageCard}>
                  <Calendar color={Colors.primary} size={20} />
                  <Text style={styles.usageNumber}>{privateProgress.remainingSessions}</Text>
                  <Text style={styles.usageLabel}>Remaining</Text>
                </View>

                <View style={styles.usageCard}>
                  <AlertCircle color={Colors.danger} size={20} />
                  <Text style={styles.usageNumber}>{privateProgress.absentSessions}</Text>
                  <Text style={styles.usageLabel}>Absent</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <Calendar color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>Private Packages</Text>
              </View>

              {privateBookings.length === 0 ? (
                <Text style={styles.noDataText}>No private packages yet</Text>
              ) : (
                privateBookings.map((booking: any) => {
                  const sessions = booking.private_booking_sessions || [];
                  const completed = sessions.filter((session: any) => session.attended === true).length;
                  const absent = sessions.filter((session: any) => session.attended === false).length;

                  return (
                    <View key={booking.id} style={styles.privatePackageCard}>
                      <Text style={styles.classItemName}>Private Package</Text>
                      <Text style={styles.classItemTime}>
                        {booking.package_hours || sessions.length} total hours • {booking.session_duration_hours || 1}h/session
                      </Text>
                      <Text style={styles.classItemLevel}>
                        {completed} present • {absent} absent • {Math.max(sessions.length - completed - absent, 0)} remaining
                      </Text>
                      {!!booking.description && (
                        <Text style={styles.privateDescription}>{booking.description}</Text>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <Calendar color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>Private Session History</Text>
              </View>

              {privateProgress.sessions.length === 0 ? (
                <Text style={styles.noDataText}>No private sessions scheduled yet</Text>
              ) : (
                privateProgress.sessions.map((session: any) => {
                  const status = getPrivateSessionStatus(session);

                  return (
                    <View key={session.id} style={styles.sessionHistoryItem}>
                      <View style={styles.classItemLeft}>
                        <Text style={styles.classItemName}>{formatDisplayDate(session.session_date)}</Text>
                        {!!session.booking?.description && (
                          <Text style={styles.classItemTime}>{session.booking.description}</Text>
                        )}
                        {!!session.note && (
                          <Text style={styles.privateDescription}>Note: {session.note}</Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          status === 'Present' && styles.statusPresent,
                          status === 'Absent' && styles.statusAbsent,
                          status === 'Upcoming' && styles.statusUpcoming,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{status}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
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
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.background,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  studentSection: {
    marginBottom: 24,
  },
  studentHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden' as const,
  },
  studentHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentAvatarText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  studentHeaderInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  studentAge: {
    fontSize: 14,
    color: Colors.gold,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gold,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressSummary: {
    marginTop: 18,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden' as const,
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.gold,
  },
  progressSummaryMain: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  progressSummarySub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },

  progressToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  progressToggleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressToggleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressToggleText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  progressToggleTextActive: {
    color: Colors.white,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  classItemLeft: {
    flex: 1,
  },
  classItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  classItemTime: {
    fontSize: 13,
    color: Colors.textLight,
  },
  classItemLevel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginTop: 3,
  },
  progressBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  usageCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  usageNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 6,
  },
  usageLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textLight,
    marginTop: 2,
  },
  makeupNotice: {
    marginTop: 14,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
  },
  makeupNoticeTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.success,
    marginBottom: 4,
  },
  makeupNoticeText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },

  privatePackageCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  privateDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
    lineHeight: 18,
  },
  sessionHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.border,
    marginLeft: 10,
  },
  statusPresent: {
    backgroundColor: '#E8F5E9',
  },
  statusAbsent: {
    backgroundColor: '#FFEBEE',
  },
  statusUpcoming: {
    backgroundColor: '#E3F2FD',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.text,
  },
});
