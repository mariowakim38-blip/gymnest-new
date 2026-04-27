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

// ✅ FIXED LOGO PATH HERE
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
              {/* ✅ FIXED HERE */}
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </LinearGradient>
          </View>

          <View style={styles.badge}>
            <Sparkles color="#FACC15" size={15} />
            <Text style={styles.badgeText}>Premium Academy</Text>
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Where Young Athletes Grow</Text>

          {isAuthenticated && user && (
            <Text style={styles.welcomeText}>
              Welcome back, {user.name.split(' ')[0]}
            </Text>
          )}

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/classes' as Href)}
          >
            <Text style={styles.heroButtonText}>Explore Classes</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { padding: 20 },
  logoShell: { alignItems: 'center' },
  logoBorder: { padding: 10 },
  logo: { width: 120, height: 80 },
  badge: { flexDirection: 'row' },
  badgeText: { color: '#fff' },
  heroContent: { marginTop: 20 },
  heroTitle: { color: '#fff', fontSize: 28 },
  welcomeText: { color: '#fff' },
  heroButton: { marginTop: 20, backgroundColor: '#fff', padding: 10 },
  heroButtonText: { color: '#000' },
});
