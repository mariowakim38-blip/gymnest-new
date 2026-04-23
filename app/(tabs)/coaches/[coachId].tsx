import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import { Star, Award, Calendar, MessageSquare, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { coaches } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useRating } from '@/contexts/RatingContext';

export default function CoachDetailScreen() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { getCoachAverageRating, getCoachRatings, addRating, getUserRatingForCoach } = useRating();
  
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const coach = coaches.find((c) => c.id === coachId);

  if (!coach) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Coach not found</Text>
      </View>
    );
  }

  const handleBookSession = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to book a private session', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/auth/login' as Href) },
      ]);
      return;
    }

    Alert.alert(
      'Book Private Session',
      `Book a private session with ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: () => {
            Alert.alert('Success', 'Private session booking request sent!');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image source={{ uri: coach.imageUrl }} style={styles.coachImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.headerOverlay}
        >
          <Text style={styles.coachName}>{coach.name}</Text>
          <View style={styles.ratingContainer}>
            <Star color={Colors.gold} size={20} fill={Colors.gold} />
            <Text style={styles.ratingText}>
              {getCoachAverageRating(coach.id) || 'New'}
            </Text>
            {getCoachRatings(coach.id).length > 0 && (
              <Text style={styles.ratingCount}>
                ({getCoachRatings(coach.id).length} reviews)
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.specializationCard}>
          <Award color={Colors.gold} size={28} />
          <View style={styles.specializationInfo}>
            <Text style={styles.specializationLabel}>Specialization</Text>
            <Text style={styles.specializationText}>{coach.specialization}</Text>
          </View>
        </View>

        <View style={styles.experienceCard}>
          <Calendar color={Colors.gold} size={28} />
          <View style={styles.experienceInfo}>
            <Text style={styles.experienceLabel}>Experience</Text>
            <Text style={styles.experienceText}>{coach.experience}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{coach.bio}</Text>
      </View>

      <View style={styles.ratingsSection}>
        <View style={styles.ratingsSectionHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => {
                if (user) {
                  const existingRating = getUserRatingForCoach(coach.id, user.id);
                  if (existingRating) {
                    setSelectedRating(existingRating.rating);
                    setComment(existingRating.comment || '');
                  }
                  setShowRatingModal(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.addReviewButtonText}>
                {getUserRatingForCoach(coach.id, user?.id || '') ? 'Edit Review' : 'Add Review'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {getCoachRatings(coach.id).length === 0 ? (
          <View style={styles.noReviewsContainer}>
            <MessageSquare color={Colors.textLight} size={40} />
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSubtext}>Be the first to review this coach!</Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {getCoachRatings(coach.id).map((rating) => (
              <View key={rating.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        color={star <= rating.rating ? Colors.gold : Colors.border}
                        fill={star <= rating.rating ? Colors.gold : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(rating.date).toLocaleDateString()}
                  </Text>
                </View>
                {rating.comment && (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>



      <View style={styles.bookingSection}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookSession}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.gold, '#c49b2e']}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>Book Private Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Coach</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRatingModal(false);
                  setSelectedRating(0);
                  setComment('');
                }}
              >
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  activeOpacity={0.7}
                >
                  <Star
                    size={40}
                    color={star <= selectedRating ? Colors.gold : Colors.border}
                    fill={star <= selectedRating ? Colors.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor={Colors.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                selectedRating === 0 && styles.submitButtonDisabled,
              ]}
              onPress={async () => {
                if (selectedRating === 0 || !user) return;
                
                const result = await addRating(
                  coach.id,
                  user.id,
                  selectedRating,
                  comment || undefined
                );
                
                if (result.success) {
                  Alert.alert('Success', 'Your review has been submitted!');
                  setShowRatingModal(false);
                  setSelectedRating(0);
                  setComment('');
                } else {
                  Alert.alert('Error', result.error || 'Failed to submit review');
                }
              }}
              disabled={selectedRating === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  coachImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  coachName: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 6,
    opacity: 0.9,
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  specializationCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specializationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  specializationLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  specializationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  experienceCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  experienceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  experienceLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bioSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },

  bookingSection: {
    paddingHorizontal: 16,
  },
  bookButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  ratingsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  ratingsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 12,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
