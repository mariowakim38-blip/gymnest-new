import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Star, Award, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { coaches } from '@/constants/mockData';
import { useRating } from '@/contexts/RatingContext';
import { trpc } from '@/lib/trpc';

export default function CoachesScreen() {
  const router = useRouter();
  const { getCoachAverageRating, getCoachRatings } = useRating();
  const { data: dbCoaches = [] } = trpc.coaches.getAll.useQuery();

  const allCoaches = dbCoaches.length > 0 ? dbCoaches : coaches;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backgroundShapes}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgTriangle} />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meet Our Expert Coaches</Text>
        <Text style={styles.headerSubtitle}>
          Experienced professionals dedicated to your child&apos;s success
        </Text>
      </View>

      {allCoaches.map((coach: any) => {
        const imageUrl = 'image_url' in coach ? coach.image_url : coach.imageUrl;
        return (
          <TouchableOpacity
            key={coach.id}
            style={styles.coachCard}
            onPress={() => router.push(`/(tabs)/coaches/${coach.id}` as Href)}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.coachImage} />
            <View style={styles.imageOverlay}>
              <View style={styles.overlayCircle} />
            </View>
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.coachHeader}>
              <Text style={styles.coachName}>{coach.name}</Text>
              <View style={styles.ratingContainer}>
                <Star color={Colors.gold} size={16} fill={Colors.gold} />
                <Text style={styles.ratingText}>
                  {getCoachAverageRating(coach.id) || 'New'}
                </Text>
                {getCoachRatings(coach.id).length > 0 && (
                  <Text style={styles.ratingCount}>
                    ({getCoachRatings(coach.id).length})
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.specializationContainer}>
              <Award color={Colors.primary} size={16} />
              <Text style={styles.specializationText}>{coach.specialization}</Text>
            </View>
            <Text style={styles.experienceText}>{coach.experience} experience</Text>
            <Text style={styles.coachBio} numberOfLines={2}>
              {coach.bio}
            </Text>
            <View style={styles.coachFooter}>
              <Text style={styles.viewProfileText}>View Profile</Text>
              <ChevronRight color={Colors.gold} size={20} />
            </View>
          </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative' as const,
  },
  backgroundShapes: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  bgCircle1: {
    position: 'absolute' as const,
    top: -30,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(157, 78, 221, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.15)',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  bgCircle2: {
    position: 'absolute' as const,
    top: 150,
    left: -50,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  bgTriangle: {
    position: 'absolute' as const,
    top: 80,
    right: 30,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 165, 0, 0.12)',
    transform: [{ rotate: '-20deg' }],
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  coachCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative' as const,
  },
  coachImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
  },
  imageOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayCircle: {
    position: 'absolute' as const,
    bottom: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  coachInfo: {
    padding: 16,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coachName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  specializationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  specializationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  experienceText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 10,
  },
  coachBio: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  coachFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewProfileText: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
});
