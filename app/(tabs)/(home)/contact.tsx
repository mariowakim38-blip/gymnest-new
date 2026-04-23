import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function ContactScreen() {
  const handleCall = () => {
    Linking.openURL('tel:+96171177611');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:gymnest24@gmail.com');
  };

  const handleLocation = () => {
    Linking.openURL('https://maps.google.com/?q=Kaslik+Sea+Side+Road+District+k+building');
  };

  const handleInstagram = () => {
    Linking.openURL('https://www.instagram.com/gymnestlb/');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, '#2a3f5f']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Get in Touch</Text>
        <Text style={styles.headerSubtitle}>
          We&apos;d love to hear from you!
        </Text>
      </LinearGradient>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <View style={styles.contactIconContainer}>
            <Phone color={Colors.gold} size={24} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>+961 71 177 611</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleEmail}
          activeOpacity={0.7}
        >
          <View style={styles.contactIconContainer}>
            <Mail color={Colors.gold} size={24} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>gymnest24@gmail.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleLocation}
          activeOpacity={0.7}
        >
          <View style={styles.contactIconContainer}>
            <MapPin color={Colors.gold} size={24} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Location</Text>
            <Text style={styles.contactValue}>
              Kaslik Sea Side Road{'\n'}District K Building
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.hoursSection}>
        <Text style={styles.sectionTitle}>Operating Hours</Text>
        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Friday</Text>
            <Text style={styles.hoursTime}>9:00 AM - 9:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Saturday</Text>
            <Text style={styles.hoursTime}>9:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Sunday</Text>
            <Text style={styles.hoursTime}>12:00 PM - 5:00 PM</Text>
          </View>
        </View>
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Follow Us</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleInstagram}
          >
            <Instagram color={Colors.white} size={24} />
          </TouchableOpacity>
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
  content: {
    paddingBottom: 32,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gold,
  },
  contactSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  hoursSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  hoursCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hoursDay: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  hoursTime: {
    fontSize: 16,
    color: Colors.textLight,
  },
  socialSection: {
    paddingHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
