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
import { Trophy, Calendar, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, any>>({});
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

      const classIds = Array.from(
        new Set((bookingsData ?? []).map((b: any) => String(b.class_id)))
      );

      let classMap: Record<string, any> = {};

      if (classIds.length > 0) {
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
  }, [isAuthenticated, user?.id]);

  const getChildBookings = (childId: string) => {
    return bookings.filter((booking) => String(booking.child_id) === String(childId));
  };

  const getEnrolledClasses = (childBookings: any[]) => {
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
        });
      }
    });

    return Array.from(map.values());
  };

  const getAttendancePercentage = (childBookings: any[]) => {
    const marked = childBookings.filter((booking) => booking.attended !== null);

    if (marked.length === 0) return 0;

    const present = marked.filter((booking) => booking.attended === true).length;

    return Math.round((present / marked.length) * 100);
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
          const enrolledClasses = getEnrolledClasses(childBookings);
          const attendance = getAttendancePercentage(childBookings);

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

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{enrolledClasses.length}</Text>
                    <Text style={styles.statLabel}>Classes</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{attendance}%</Text>
                    <Text style={styles.statLabel}>Attendance</Text>
                  </View>
                </View>
              </LinearGradient>

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
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
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
});
