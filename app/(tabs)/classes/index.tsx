import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import {
  Search,
  Clock,
  Users as UsersIcon,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBooking } from '@/contexts/BookingContext';
import { trpc } from '@/lib/trpc';

export default function ClassesScreen() {
  const router = useRouter();
  const { bookings } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const { data: classes = [], isLoading } = trpc.classes.getAll.useQuery();
  const { data: coaches = [] } = trpc.coaches.getAll.useQuery();

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredClasses = classes.filter((cls: any) => {
    const name = cls.name || '';
    const ageGroup = cls.ageGroup || '';
    const level = cls.level || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ageGroup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      selectedLevel === 'All' ||
      level.toLowerCase().includes(selectedLevel.toLowerCase());

    return matchesSearch && matchesLevel;
  });

  const getCoachName = (coachId?: string | null) => {
    if (!coachId) return 'No coach assigned';

    const coach = coaches.find((c: any) => c.id === coachId);
    return coach ? coach.name : 'No coach assigned';
  };

  const getEnrolledCount = (classId: string) => {
    const classBookings = bookings.filter(
      (booking) => booking.classId === classId && booking.status !== 'cancelled'
    );

    const uniqueStudents = new Set(
      classBookings.map((booking) => booking.studentId)
    );

    return uniqueStudents.size;
  };

  const getAvailabilityColor = (enrolled: number, capacity: number) => {
    const percentage = capacity > 0 ? (enrolled / capacity) * 100 : 0;

    if (percentage >= 100) return Colors.error;
    if (percentage >= 80) return Colors.warning;

    return Colors.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.decorativeHeader}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerTriangle} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color={Colors.mediumGray} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.mediumGray}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterChip,
              selectedLevel === level && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLevel === level && styles.filterChipTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.classList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.classListContent}
        bounces={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading classes...</Text>
          </View>
        ) : filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No classes found</Text>
          </View>
        ) : (
          filteredClasses.map((cls: any) => {
            const enrolled = getEnrolledCount(cls.id);
            const capacity = cls.capacity || 0;

            return (
              <TouchableOpacity
                key={cls.id}
                style={styles.classCard}
                onPress={() =>
                  router.push(`/(tabs)/classes/${cls.id}` as Href)
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardShapes}>
                  <View style={styles.cardCircle} />
                  <View style={styles.cardGlow} />
                </View>

                <View style={styles.classHeader}>
                  <View style={styles.classHeaderLeft}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.classAgeGroup}>{cls.ageGroup}</Text>
                  </View>

                  <View
                    style={[
                      styles.levelBadge,
                      cls.level === 'Beginner' && styles.levelBadgeBeginner,
                      cls.level === 'Intermediate' && styles.levelBadgeIntermediate,
                      cls.level === 'Advanced' && styles.levelBadgeAdvanced,
                    ]}
                  >
                    <Text style={styles.levelBadgeText}>{cls.level}</Text>
                  </View>
                </View>

                <Text style={styles.classDescription} numberOfLines={2}>
                  {cls.description}
                </Text>

                <View style={styles.classDetails}>
                  <View style={styles.classDetailItem}>
                    <Clock color={Colors.mediumGray} size={16} />
                    <Text style={styles.classDetailText}>
                      {cls.day}, {cls.time} ({cls.duration})
                    </Text>
                  </View>

                  <View style={styles.classDetailItem}>
                    <UsersIcon color={Colors.mediumGray} size={16} />
                    <Text style={styles.classDetailText}>
                      Coach: {getCoachName(cls.coachId)}
                    </Text>
                  </View>
                </View>

                <View style={styles.classFooter}>
                  <View style={styles.availabilityContainer}>
                    <View
                      style={[
                        styles.availabilityDot,
                        {
                          backgroundColor: getAvailabilityColor(
                            enrolled,
                            capacity
                          ),
                        },
                      ]}
                    />

                    <Text style={styles.availabilityText}>
                      {enrolled}/{capacity} enrolled
                      {capacity > 0 && enrolled >= capacity ? ' (Full)' : ''}
                    </Text>
                  </View>

                  <ChevronRight color={Colors.primary} size={20} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative' as const,
  },
  decorativeHeader: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
  },
  headerCircle1: {
    position: 'absolute' as const,
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 157, 0.15)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  headerTriangle: {
    position: 'absolute' as const,
    top: 20,
    left: -50,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 85,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(157, 78, 221, 0.1)',
    transform: [{ rotate: '25deg' }],
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  classList: {
    flex: 1,
  },
  classListContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  classCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  cardShapes: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
  },
  cardCircle: {
    position: 'absolute' as const,
    top: -25,
    right: -25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 165, 0, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.12)',
  },
  cardGlow: {
    position: 'absolute' as const,
    top: 5,
    right: 5,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(43, 127, 191, 0.12)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  classHeaderLeft: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  classAgeGroup: {
    fontSize: 14,
    color: Colors.textLight,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  levelBadgeBeginner: {
    backgroundColor: '#e3f2fd',
  },
  levelBadgeIntermediate: {
    backgroundColor: '#fff3e0',
  },
  levelBadgeAdvanced: {
    backgroundColor: '#fce4ec',
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  classDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  classDetails: {
    gap: 8,
    marginBottom: 12,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classDetailText: {
    fontSize: 14,
    color: Colors.text,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
});
