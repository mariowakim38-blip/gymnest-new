import React, { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// ✅ FIXED LOGO PATH
const LOGO = require('@/assets/images/logo.jpeg');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Home announcements fetch error:', error);
        setAnnouncements([]);
        return;
      }

      setAnnouncements(data || []);
    };

    fetchAnnouncements();
  }, []);

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
      
      {/* HERO */}
      <LinearGradient
        colors={['#050B18', '#0B2447', '#123C69']}
        style={styles.heroSection}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.logoShell}>
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.08)']}
              style={styles.logoBorder}
            >
              {/* ✅ FIXED */}
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
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
          >
            <Text style={styles.heroButtonText}>Explore Classes</Text>
            <ArrowRight color="#0B2447" size={18} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      <View style={styles.content}>
        
        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => router.push(action.route)}
            >
              <LinearGradient
                colors={action.colors as [string, string]}
                style={styles.quickActionIconContainer}
              >
                <action.icon color="#FFFFFF" size={26} />
              </LinearGradient>

              <Text style={styles.quickActionText}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ANNOUNCEMENTS */}
        <Text style={styles.sectionTitle}>Announcements</Text>

        {announcements.length === 0 ? (
          <Text>No announcements yet</Text>
        ) : (
          announcements.map((a) => (
            <View key={a.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{a.title}</Text>
              <Text>{a.message}</Text>
            </View>
          ))
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },

  heroSection: { padding: 20 },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  logoShell: { width: 120, height: 90 },

  logoBorder: {
    width: 120,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: { width: 100, height: 70 },

  badge: { flexDirection: 'row', alignItems: 'center' },

  badgeText: { color: '#fff' },

  heroContent: { marginTop: 20 },

  heroEyebrow: { color: '#A7D8F5' },

  heroTitle: { color: '#fff', fontSize: 30 },

  heroSubtitle: { color: '#ccc' },

  welcomePill: { marginTop: 10 },

  welcomeText: { color: '#fff' },

  heroButton: {
    marginTop: 15,
    backgroundColor: '#fff',
    padding: 10,
  },

  heroButtonText: { color: '#000' },

  content: { padding: 20 },

  sectionTitle: { fontSize: 20, marginBottom: 10 },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },

  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickActionText: { fontWeight: 'bold' },

  quickActionSubtitle: { color: '#666' },

  announcementCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
  },

  announcementTitle: { fontWeight: 'bold' },
});
