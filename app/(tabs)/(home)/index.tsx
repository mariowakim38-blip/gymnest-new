import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Colors from '@/constants/colors';

const LOGO = require('@/assets/images/logo.jpeg');

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gymnest</Text>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <Text style={styles.premium}>✨ Premium Academy</Text>

        <Text style={styles.title}>Where Young Athletes Grow</Text>
        <Text style={styles.subtitle}>Welcome back 👋</Text>

        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Explore Classes</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>📅 Book Class</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>📊 My Attendance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>👤 Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>📷 Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ANNOUNCEMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Announcements</Text>

        <View style={styles.announcement}>
          <Text style={styles.announcementText}>
            🎉 New classes available this week!
          </Text>
        </View>

        <View style={styles.announcement}>
          <Text style={styles.announcementText}>
            📢 Summer camp registrations are open.
          </Text>
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

  header: {
    backgroundColor: Colors.primary,
    padding: 16,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  hero: {
    padding: 20,
    backgroundColor: '#0f2a4d',
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  premium: {
    color: '#ffd700',
    fontSize: 14,
    marginBottom: 5,
  },

  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#ddd',
    marginBottom: 15,
  },

  cta: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  ctaText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  section: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    elevation: 2,
  },

  cardTitle: {
    fontWeight: '600',
  },

  announcement: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  announcementText: {
    color: '#333',
  },
});
