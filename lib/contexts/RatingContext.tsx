import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Rating {
  id: string;
  coachId: string;
  userId: string;
  rating: number;
  comment?: string;
  date: string;
}

const RATINGS_KEY = '@gymnest_ratings';

export const [RatingProvider, useRating] = createContextHook(() => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const data = await AsyncStorage.getItem(RATINGS_KEY);
      if (data) {
        setRatings(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRating = useCallback(async (
    coachId: string,
    userId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      const existingRatingIndex = ratings.findIndex(
        r => r.coachId === coachId && r.userId === userId
      );

      let updated: Rating[];
      
      if (existingRatingIndex !== -1) {
        updated = ratings.map((r, index) =>
          index === existingRatingIndex
            ? { ...r, rating, comment, date: new Date().toISOString() }
            : r
        );
      } else {
        const newRating: Rating = {
          id: Date.now().toString(),
          coachId,
          userId,
          rating,
          comment,
          date: new Date().toISOString(),
        };
        updated = [...ratings, newRating];
      }

      setRatings(updated);
      await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      console.error('Failed to add rating:', error);
      return { success: false, error: 'Rating submission failed' };
    }
  }, [ratings]);

  const getCoachRatings = useCallback((coachId: string) => {
    return ratings.filter(r => r.coachId === coachId);
  }, [ratings]);

  const getCoachAverageRating = useCallback((coachId: string) => {
    const coachRatings = ratings.filter(r => r.coachId === coachId);
    if (coachRatings.length === 0) return 0;
    
    const sum = coachRatings.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / coachRatings.length).toFixed(1));
  }, [ratings]);

  const getUserRatingForCoach = useCallback((coachId: string, userId: string) => {
    return ratings.find(r => r.coachId === coachId && r.userId === userId);
  }, [ratings]);

  const deleteRating = useCallback(async (ratingId: string) => {
    try {
      const updated = ratings.filter(r => r.id !== ratingId);
      setRatings(updated);
      await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete rating:', error);
      return { success: false, error: 'Rating deletion failed' };
    }
  }, [ratings]);

  return useMemo(() => ({
    ratings,
    isLoading,
    addRating,
    getCoachRatings,
    getCoachAverageRating,
    getUserRatingForCoach,
    deleteRating,
  }), [ratings, isLoading, addRating, getCoachRatings, getCoachAverageRating, getUserRatingForCoach, deleteRating]);
});
