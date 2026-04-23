import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Trophy, Calendar, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { classes } from '@/constants/mockData';

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getStudentBookings } = useBooking();

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

  const children = user.children || [];



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
      ) : (
        children.map((child) => {
          const studentBookings = getStudentBookings(child.id);
          const enrolledClasses = classes.filter((cls) =>
            studentBookings.some((b) => b.classId === cls.id)
          );

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
                    <Text style={styles.statValue}>95%</Text>
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
                  enrolledClasses.map((cls) => (
                    <View key={cls.id} style={styles.classItem}>
                      <View style={styles.classItemLeft}>
                        <Text style={styles.classItemName}>{cls.name}</Text>
                        <Text style={styles.classItemTime}>
                          {cls.day}, {cls.time}
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
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
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
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
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
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
  progressBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
