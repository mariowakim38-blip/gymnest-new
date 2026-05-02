import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Trophy, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
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

type PrivateProgressData = {
  percentage: number;
  completedSessions: number;
  totalSessions: number;
  remainingSessions: number;
  absentSessions: number;
  expiredSessions: number;
  packagesCount: number;
};

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, any>>({});
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
        setLoading(false);
        return;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .in('child_id', childIds)
        .order('attended_date', { ascending: true });

      if (attendanceError) {
        console.error('Progress attendance records error:', attendanceError);
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
        .in('child_id', childIds)
        .order('start_date', { ascending: true });

      if (privateError) {
        console.error('Private progress error:', privateError);
        setPrivateBookings([]);
      } else {
        setPrivateBookings(privateData ?? []);
      }

      const classIds = Array.from(
        new Set((bookingsData ?? []).map((b: any) => String(b.class_id)))
      );

      const attendedClassIds = Array.from(
        new Set((attendanceData ?? []).map((r: any) => String(r.attended_class_id)).filter(Boolean))
      );

      const allClassIds = Array.from(new Set([...classIds, ...attendedClassIds]));

      const classMap: Record<string, any> = {};

      if (allClassIds.length > 0) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, age_group, day, time, duration, level');

        if (classesError) {
          console.error('Progress classes error:', classesError);
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
  }, [isAuthenticated, user?.id, children.length]);

  const safeDate = (dateString: string) => {
    if (!dateString) return new Date();
    return new Date(`${dateString}T12:00:00`);
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

  const isPastSession = (dateString: string) => {
    if (!dateString) return false;

    const sessionDate = safeDate(dateString);
    const today = new Date();

    sessionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return sessionDate.getTime() < today.getTime();
  };

  const getChildBookings = (childId: string) => {
    return bookings.filter((booking) => String(booking.child_id) === String(childId));
  };

  const getChildAttendanceRecords = (childId: string) => {
    return attendanceRecords.filter(
      (record) =>
        String(record.child_id) === String(childId) &&
        record.status === 'present'
    );
  };

  const getChildPrivateBookings = (childId: string) => {
    return privateBookings.filter((booking) => String(booking.child_id) === String(childId));
  };

  const getEnrolledClasses = (childBookings: any[], childAttendanceRecords: any[]) => {
    const map = new Map<string, any>();

    childBookings.forEach((booking) => {
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

    childAttendanceRecords.forEach((record) => {
      const classId = record.attended_class_id;
      const cls = classesMap[String(classId)];

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

  const getProgressData = (
    childBookings: any[],
    childAttendanceRecords: any[]
  ): ProgressData => {
    const activeBookings = childBookings.filter(
      (booking) => booking.status !== 'cancelled'
    );

    const totalSessions = activeBookings.length;

    const regularCompleted = activeBookings.filter(
      (booking) => booking.attended === true
    ).length;

    const makeupSessions = childAttendanceRecords.filter(
      (record) => record.attendance_type === 'makeup' || record.attendance_type === 'manual'
    ).length;

    const completedSessions = regularCompleted + makeupSessions;

    const expiredSessions = activeBookings.filter(
      (booking) =>
        booking.attended !== true &&
        booking.status !== 'cancelled' &&
        isPastSession(booking.booking_date)
    ).length;

    const remainingSessions = Math.max(totalSessions - completedSessions - expiredSessions, 0);
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

  const getPrivateProgressData = (childPrivateBookings: any[]): PrivateProgressData => {
    const activePrivateBookings = childPrivateBookings.filter(
      (booking) => booking.status !== 'cancelled'
    );

    const sessions = activePrivateBookings.flatMap((booking) =>
      (booking.private_booking_sessions || []).map((session: any) => ({
        ...session,
        booking,
      }))
    );

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((session) => session.attended === true).length;
    const absentSessions = sessions.filter((session) => session.attended === false).length;
    const expiredSessions = sessions.filter(
      (session) => session.attended !== true && session.attended !== false && isPastSession(session.session_date)
    ).length;
    const remainingSessions = sessions.filter(
      (session) => session.attended !== true && session.attended !== false && !isPastSession(session.session_date)
    ).length;

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
      expiredSessions,
      packagesCount: activePrivateBookings.length,
    };
  };

  const getPrivateSessions = (childPrivateBookings: any[]) => {
    return childPrivateBookings
      .flatMap((booking) =>
        (booking.private_booking_sessions || []).map((session: any) => ({
          ...session,
          booking,
        }))
      )
      .sort((a, b) => safeDate(a.session_date).getTime() - safeDate(b.session_date).getTime());
  };

  const getProgressBarWidth = (percentage: number) => {
    return `${Math.min(Math.max(percentage, 0), 100)}%` as `${number}%`;
  };

  const getPrivateSessionLabel = (session: any) => {
    if (session.attended === true) return 'Present';
    if (session.attended === false) return 'Absent';
    if (isPastSession(session.session_date)) return 'Expired';
    return 'Upcoming';
  };

  const getPrivateSessionBadgeStyle = (session: any) => {
    if (session.attended === true) return styles.sessionBadgePresent;
    if (session.attended === false) return styles.sessionBadgeAbsent;
    if (isPastSession(session.session_date)) return styles.sessionBadgeExpired;
    return styles.sessionBadgeUpcoming;
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Trophy color={Colors.mediumGray} size={64} />
          <Text style={styles.emptyStateTitle}>Login Required</Text>
          <Text style={styles.emptyStateText}>
            Please log in to view student progress
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login' as Href)}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {children.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy color={Colors.mediumGray} size={64} />
          <Text style={styles.emptyStateTitle}>No Students Added</Text>
          <Text style={styles.emptyStateText}>
            Add your children to track their progress
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyStateText}>Loading progress...</Text>
        </View>
      ) : (
        children.map((child: any) => {
          const childBookings = getChildBookings(child.id);
          const childAttendanceRecords = getChildAttendanceRecords(child.id);
          const childPrivateBookings = getChildPrivateBookings(child.id);
          const classProgress = getProgressData(childBookings, childAttendanceRecords);
          const privateProgress = getPrivateProgressData(childPrivateBookings);
          const selectedProgress = progressType === 'class' ? classProgress : privateProgress;
          const enrolledClasses = getEnrolledClasses(childBookings, childAttendanceRecords);
          const privateSessionsForChild = getPrivateSessions(childPrivateBookings);

          return (
            <View key={child.id} style={styles.studentSection}>
              <LinearGradient
                colors={[Colors.primary, '#2a3f5f']}
                style={styles.studentHeader}
              >
                <View style={styles.headerShapes}>
                  <View style={styles.headerCircle} />
                  <View style={styles.headerTriangleShape} />
                  <View style={styles.headerGlow} />
                </View>

                <View style={styles.studentHeaderContent}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>
                      {child.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.studentHeaderInfo}>
                    <Text style={styles.studentName}>{child.name}</Text>
                    <Text style={styles.studentAge}>{child.age} years old</Text>
                  </View>
                </View>

                <View style={styles.progressToggle}>
                  <TouchableOpacity
                    style={[
                      styles.progressToggleButton,
                      progressType === 'class' && styles.progressToggleButtonActive,
                    ]}
                    onPress={() => setProgressType('class')}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.progressToggleText,
                        progressType === 'class' && styles.progressToggleTextActive,
                      ]}
                    >
                      Class Progress
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.progressToggleButton,
                      progressType === 'private' && styles.progressToggleButtonActive,
                    ]}
                    onPress={() => setProgressType('private')}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.progressToggleText,
                        progressType === 'private' && styles.progressToggleTextActive,
                      ]}
                    >
                      Private Progress
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {progressType === 'class' ? enrolledClasses.length : privateProgress.packagesCount}
                    </Text>
                    <Text style={styles.statLabel}>{progressType === 'class' ? 'Classes' : 'Packages'}</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{selectedProgress.percentage}%</Text>
                    <Text style={styles.statLabel}>Progress</Text>
                  </View>
                </View>

                <View style={styles.progressSummary}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: getProgressBarWidth(selectedProgress.percentage) },
                      ]}
                    />
                  </View>

                  <Text style={styles.progressSummaryMain}>
                    {selectedProgress.completedSessions} / {selectedProgress.totalSessions} sessions completed
                  </Text>

                  <Text style={styles.progressSummarySub}>
                    {selectedProgress.remainingSessions} remaining
                    {progressType === 'class' && classProgress.expiredSessions > 0 ? ` • ${classProgress.expiredSessions} expired` : ''}
                    {progressType === 'class' && classProgress.makeupSessions > 0 ? ` • ${classProgress.makeupSessions} make-up used` : ''}
                    {progressType === 'private' && privateProgress.absentSessions > 0 ? ` • ${privateProgress.absentSessions} absent` : ''}
                    {progressType === 'private' && privateProgress.expiredSessions > 0 ? ` • ${privateProgress.expiredSessions} expired` : ''}
                  </Text>
                </View>
              </LinearGradient>

              {progressType === 'class' ? (
                <>
                  <View style={styles.sectionContent}>
                    <View style={styles.contentShapes}>
                      <View style={styles.contentCircle1} />
                      <View style={styles.contentCircle2} />
                    </View>

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
                          {classProgress.makeupSessions === 1 ? '' : 's'} deducted from the total package usage.
                        </Text>
                      </View>
                    )}

                    {classProgress.expiredSessions > 0 && (
                      <View style={styles.expiredNotice}>
                        <Text style={styles.expiredNoticeTitle}>Expired sessions</Text>
                        <Text style={styles.expiredNoticeText}>
                          Past sessions that were not marked present are counted as expired and are no longer remaining.
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
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
                        <Text style={styles.usageLabel}>Upcoming</Text>
                      </View>

                      <View style={styles.usageCard}>
                        <AlertCircle color={Colors.danger} size={20} />
                        <Text style={styles.usageNumber}>{privateProgress.absentSessions}</Text>
                        <Text style={styles.usageLabel}>Absent</Text>
                      </View>
                    </View>

                    {childPrivateBookings.length === 0 ? (
                      <Text style={styles.noDataText}>No private sessions booked yet</Text>
                    ) : (
                      childPrivateBookings.map((booking: any) => (
                        <View key={booking.id} style={styles.privatePackageCard}>
                          <Text style={styles.privatePackageTitle}>{booking.title || 'Private Session'}</Text>
                          <Text style={styles.privatePackageText}>
                            Package: {booking.package_hours || booking.total_sessions || 0} hours
                            {booking.session_duration_hours ? ` • ${booking.session_duration_hours}h/session` : ''}
                          </Text>
                          <Text style={styles.privatePackageText}>
                            Day: {booking.selected_weekday || booking.preferred_day || 'Not set'}
                            {booking.start_date ? ` • Starts ${formatDisplayDate(booking.start_date)}` : ''}
                          </Text>
                          {!!(booking.description || booking.notes) && (
                            <Text style={styles.privatePackageText}>
                              Notes: {booking.description || booking.notes}
                            </Text>
                          )}
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.sectionContent}>
                    <View style={styles.sectionHeader}>
                      <Calendar color={Colors.primary} size={20} />
                      <Text style={styles.sectionTitle}>Private Session History</Text>
                    </View>

                    {privateSessionsForChild.length === 0 ? (
                      <Text style={styles.noDataText}>No private session dates yet</Text>
                    ) : (
                      privateSessionsForChild.map((session: any) => (
                        <View key={session.id} style={styles.privateSessionItem}>
                          <View style={styles.classItemLeft}>
                            <Text style={styles.classItemName}>{formatDisplayDate(session.session_date)}</Text>
                            {!!session.note && <Text style={styles.classItemTime}>{session.note}</Text>}
                          </View>

                          <View style={[styles.sessionBadge, getPrivateSessionBadgeStyle(session)]}>
                            <Text style={styles.sessionBadgeText}>{getPrivateSessionLabel(session)}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })
      )}
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
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  loginButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  studentSection: {
    marginBottom: 24,
  },
  studentHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  headerShapes: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerCircle: {
    position: 'absolute' as const,
    top: -50,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.25)',
  },
  headerTriangleShape: {
    position: 'absolute' as const,
    bottom: -20,
    left: -40,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 45,
    borderRightWidth: 45,
    borderBottomWidth: 75,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(157, 78, 221, 0.15)',
    transform: [{ rotate: '30deg' }],
  },
  headerGlow: {
    position: 'absolute' as const,
    top: '40%',
    left: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
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
  },
  progressToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    padding: 4,
    marginBottom: 18,
    gap: 6,
  },
  progressToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  progressToggleButtonActive: {
    backgroundColor: Colors.white,
  },
  progressToggleText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '900' as const,
  },
  progressToggleTextActive: {
    color: Colors.primary,
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
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  contentShapes: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
  },
  contentCircle1: {
    position: 'absolute' as const,
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(157, 78, 221, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.12)',
  },
  contentCircle2: {
    position: 'absolute' as const,
    top: 120,
    right: 10,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 165, 0, 0.08)',
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
  expiredNotice: {
    marginTop: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
  },
  expiredNoticeTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.danger,
    marginBottom: 4,
  },
  expiredNoticeText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  privatePackageCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privatePackageTitle: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  privatePackageText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
    marginTop: 2,
  },
  privateSessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  sessionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sessionBadgePresent: {
    backgroundColor: '#E8F5E9',
  },
  sessionBadgeAbsent: {
    backgroundColor: '#FFEBEE',
  },
  sessionBadgeUpcoming: {
    backgroundColor: '#E3F2FD',
  },
  sessionBadgeExpired: {
    backgroundColor: '#FFF3E0',
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '900' as const,
    color: Colors.text,
  },
});
