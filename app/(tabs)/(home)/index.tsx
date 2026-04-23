import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Calendar, Users, Image as ImageIcon, Phone, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: announcements = [] } = trpc.announcements.getAll.useQuery();

  const quickActions = [
    { id: '1', title: 'Book a Class', icon: Calendar, route: '/(tabs)/classes' as Href, color: Colors.primary },
    { id: '2', title: 'Our Coaches', icon: Users, route: '/(tabs)/coaches' as Href, color: '#FF6B9D' },
    { id: '3', title: 'Gallery', icon: ImageIcon, route: '/(tabs)/(home)/gallery' as Href, color: '#9D4EDD' },
    { id: '4', title: 'Contact Us', icon: Phone, route: '/(tabs)/(home)/contact' as Href, color: '#FFA500' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.primary, Colors.black, Colors.primary]}
        style={styles.heroSection}
      >
        <View style={styles.lightingOverlay}>
          <View style={styles.lightGlow1} />
          <View style={styles.lightGlow2} />
          <View style={styles.lightGlow3} />
          <View style={styles.lightGlow4} />
          <View style={styles.lightGlow5} />
          <View style={styles.lightGlow6} />
        </View>
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v3zrj7cyl4nnc13f8gqyb' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Welcome to Gymnest</Text>
          <Text style={styles.heroSubtitle}>
            Where Champions Are Made
          </Text>
          {isAuthenticated && user && (
            <Text style={styles.welcomeText}>
              Hello, {user.name.split(' ')[0]}! 👋
            </Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <View style={styles.cardDecoration}>
                  <View style={[styles.smallCircle, { borderColor: action.color + '20' }]} />
                  <View style={[styles.smallGlow, { backgroundColor: action.color + '10' }]} />
                </View>
                <View style={[styles.quickActionIconContainer, { backgroundColor: action.color }]}>
                  <action.icon color={Colors.white} size={28} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.announcementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/events' as Href)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {announcements.slice(0, 3).map((announcement) => (
            <View
              key={announcement.id}
              style={[
                styles.announcementCard,
                announcement.type === 'promotion' && styles.promotionCard,
              ]}
            >
              <View style={styles.announcementHeader}>
                <View
                  style={[
                    styles.announcementBadge,
                    announcement.type === 'promotion' && styles.promotionBadge,
                    announcement.type === 'event' && styles.eventBadge,
                  ]}
                >
                  <Text style={styles.announcementBadgeText}>
                    {announcement.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementMessage}>
                {announcement.message}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.lightBlue]}
            style={styles.ctaCard}
          >
            <Trophy color={Colors.white} size={32} />
            <Text style={styles.ctaTitle}>Ready to Start?</Text>
            <Text style={styles.ctaSubtitle}>
              Join our community of young athletes
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(tabs)/classes' as Href)}
            >
              <Text style={styles.ctaButtonText}>Browse Classes</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 20,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  lightingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightGlow1: {
    position: 'absolute' as const,
    top: -100,
    left: -50,
    width: 300,
    height: 400,
    backgroundColor: '#5BA3D0',
    opacity: 0.2,
    transform: [{ rotate: '25deg' }],
  },
  lightGlow2: {
    position: 'absolute' as const,
    top: 50,
    right: -80,
    width: 250,
    height: 350,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
    transform: [{ rotate: '-20deg' }],
  },
  lightGlow3: {
    position: 'absolute' as const,
    top: '30%',
    left: -100,
    width: 280,
    height: 380,
    backgroundColor: '#5BA3D0',
    opacity: 0.15,
    transform: [{ rotate: '30deg' }],
  },
  lightGlow4: {
    position: 'absolute' as const,
    bottom: -50,
    right: -60,
    width: 320,
    height: 420,
    backgroundColor: '#FFFFFF',
    opacity: 0.13,
    transform: [{ rotate: '22deg' }],
  },
  lightGlow5: {
    position: 'absolute' as const,
    bottom: -80,
    left: '20%',
    width: 260,
    height: 360,
    backgroundColor: '#5BA3D0',
    opacity: 0.18,
    transform: [{ rotate: '-25deg' }],
  },
  lightGlow6: {
    position: 'absolute' as const,
    top: '15%',
    right: '15%',
    width: 200,
    height: 300,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
    transform: [{ rotate: '35deg' }],
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.lightBlue,
    textAlign: 'center',
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: Colors.white,
    marginTop: 16,
    fontWeight: '500' as const,
  },
  content: {
    padding: 20,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  cardDecoration: {
    position: 'absolute' as const,
    top: -15,
    right: -15,
  },
  smallCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(43, 127, 191, 0.04)',
    borderWidth: 2,
  },
  smallGlow: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  announcementsContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  announcementCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promotionCard: {
    borderLeftColor: Colors.lightBlue,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promotionBadge: {
    backgroundColor: Colors.lightBlue,
  },
  eventBadge: {
    backgroundColor: Colors.success,
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  announcementMessage: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  ctaContainer: {
    marginBottom: 20,
  },
  ctaCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginTop: 12,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 20,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
});
