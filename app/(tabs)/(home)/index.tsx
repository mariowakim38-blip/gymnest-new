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
import {
  Calendar,
  Users,
  Image as ImageIcon,
  Phone,
  Trophy,
  Sparkles,
  ArrowRight,
  Star,
  Megaphone,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: announcements = [] } = trpc.announcements.getAll.useQuery();

  const quickActions = [
    {
      id: '1',
      title: 'Book a Class',
      subtitle: 'Reserve your spot',
      icon: Calendar,
      route: '/(tabs)/classes' as Href,
      colors: ['#1D74B8', '#54B6E8'],
    },
    {
      id: '2',
      title: 'Our Coaches',
      subtitle: 'Meet the team',
      icon: Users,
      route: '/(tabs)/coaches' as Href,
      colors: ['#A855F7', '#EC4899'],
    },
    {
      id: '3',
      title: 'Gallery',
      subtitle: 'See moments',
      icon: ImageIcon,
      route: '/(tabs)/(home)/gallery' as Href,
      colors: ['#7C3AED', '#38BDF8'],
    },
    {
      id: '4',
      title: 'Contact Us',
      subtitle: 'Get support',
      icon: Phone,
      route: '/(tabs)/(home)/contact' as Href,
      colors: ['#F97316', '#FACC15'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#050B18', '#0B2447', '#123C69']}
        style={styles.heroSection}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.heroGlowThree} />

        <View style={styles.heroTopRow}>
          <View style={styles.logoShell}>
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.08)']}
              style={styles.logoBorder}
            >
              <Image
                source={require('../../../assets/images/gymnest logo new white.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          <View style={styles.badge}>
            <Sparkles color="#FACC15" size={15} />
            <Text style={styles.badgeText}>Premium Academy</Text>
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>GYMNEST GYMNASTICS</Text>
          <Text style={styles.heroTitle}>Where Young Athletes Grow</Text>
          <Text style={styles.heroSubtitle}>
            Professional gymnastics training, trusted coaches, and a safe space
            for every child to progress.
          </Text>

          {isAuthenticated && user && (
            <View style={styles.welcomePill}>
              <Star color="#FACC15" size={16} fill="#FACC15" />
              <Text style={styles.welcomeText}>
                Welcome back, {user.name.split(' ')[0]}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/classes' as Href)}
            activeOpacity={0.85}
          >
            <Text style={styles.heroButtonText}>Explore Classes</Text>
            <ArrowRight color="#0B2447" size={18} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>Start Here</Text>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
        </View>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => router.push(action.route)}
              activeOpacity={0.85}
            >
              <View style={styles.cardGlow} />

              <LinearGradient
                colors={action.colors as [string, string]}
                style={styles.quickActionIconContainer}
              >
                <action.icon color="#FFFFFF" size={26} strokeWidth={2.4} />
              </LinearGradient>

              <Text style={styles.quickActionText}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>

              <View style={styles.cardArrow}>
                <ArrowRight color="#6B7280" size={16} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.announcementsContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>Latest News</Text>
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>

            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/(home)/events' as Href)}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight color="#1D74B8" size={15} />
            </TouchableOpacity>
          </View>

          {announcements.length === 0 ? (
            <View style={styles.emptyAnnouncementCard}>
              <Megaphone color="#1D74B8" size={26} />
              <Text style={styles.emptyTitle}>No announcements yet</Text>
              <Text style={styles.emptyText}>
                New events and updates will appear here.
              </Text>
            </View>
          ) : (
            announcements.slice(0, 3).map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementTop}>
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

                <Text style={styles.announcementTitle}>
                  {announcement.title}
                </Text>
                <Text style={styles.announcementMessage}>
                  {announcement.message}
                </Text>
              </View>
            ))
          )}
        </View>

        <LinearGradient
          colors={['#0B2447', '#1D74B8', '#54B6E8']}
          style={styles.ctaCard}
        >
          <View style={styles.ctaGlow} />
          <View style={styles.trophyCircle}>
            <Trophy color="#FFFFFF" size={32} />
          </View>

          <Text style={styles.ctaTitle}>Ready to Start?</Text>
          <Text style={styles.ctaSubtitle}>
            Choose the perfect class and help your child build strength,
            confidence, and discipline.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/classes' as Href)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Browse Classes</Text>
            <ArrowRight color="#0B2447" size={18} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  heroSection: {
    minHeight: 430,
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 22,
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroGlowOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(84, 182, 232, 0.22)',
    top: -80,
    right: -70,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    bottom: -90,
    left: -80,
  },
  heroGlowThree: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 160,
    left: 60,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoShell: {
    width: 120,
    height: 90,
    borderRadius: 28,
  },
  logoBorder: {
    width: 120,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  logo: {
    width: 108,
    height: 78,
    borderRadius: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroContent: {
    marginTop: 34,
  },
  heroEyebrow: {
    color: '#A7D8F5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 39,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -1,
    maxWidth: 340,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 340,
    fontWeight: '500',
  },
  welcomePill: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroButton: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  heroButtonText: {
    color: '#0B2447',
    fontSize: 15,
    fontWeight: '900',
  },
  content: {
    padding: 20,
    paddingTop: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#1D74B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 32,
  },
  quickActionCard: {
    width: (width - 54) / 2,
    minHeight: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  },
  cardGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(29, 116, 184, 0.07)',
    top: -36,
    right: -36,
  },
  quickActionIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 5,
  },
  quickActionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  cardArrow: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementsContainer: {
    marginBottom: 32,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF5FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  seeAllText: {
    fontSize: 13,
    color: '#1D74B8',
    fontWeight: '900',
  },
  emptyAnnouncementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 5,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  announcementTop: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  announcementBadge: {
    backgroundColor: '#1D74B8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  promotionBadge: {
    backgroundColor: '#A855F7',
  },
  eventBadge: {
    backgroundColor: '#10B981',
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 7,
  },
  announcementMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    fontWeight: '500',
  },
  ctaCard: {
    borderRadius: 30,
    padding: 26,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: -90,
    right: -70,
  },
  trophyCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B2447',
  },
});
