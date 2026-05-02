import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { CalendarDays, ChevronRight, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function ClassesScreen() {
  const router = useRouter();

  const openMonthlyBuilder = () => {
    router.push('/classes/monthly-plan' as Href);
  };

  const openPrivateBooking = () => {
    router.push('/classes/private-booking' as Href);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroPill}>
          <Sparkles color={Colors.primary} size={15} />
          <Text style={styles.heroPillText}>Monthly Training Plans</Text>
        </View>

        <Text style={styles.heroTitle}>Build your child’s gymnastics schedule</Text>
        <Text style={styles.heroSubtitle}>
          Choose a monthly package, select weekly training hours, then pick the start date.
        </Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={openMonthlyBuilder}
          activeOpacity={0.88}
        >
          <View>
            <Text style={styles.bookButtonTitle}>Book a Class</Text>
            <Text style={styles.bookButtonSubtitle}>Package • Weekly schedule • Start date</Text>
          </View>
          <ChevronRight color={Colors.white} size={28} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, styles.privateButton]}
          onPress={openPrivateBooking}
          activeOpacity={0.88}
        >
          <View>
            <Text style={styles.bookButtonTitle}>Book a Private</Text>
            <Text style={styles.bookButtonSubtitle}>4h • 8h • 16h package</Text>
          </View>
          <ChevronRight color={Colors.white} size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <CalendarDays color={Colors.primary} size={24} />
        <View style={styles.infoTextBox}>
          <Text style={styles.infoTitle}>How booking works</Text>
          <Text style={styles.infoText}>
            Choose monthly hours first, then select the exact days and times your child will attend every week.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 18,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 18,
  },
  heroPillText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: Colors.textLight,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  privateButton: {
    marginTop: 14,
    backgroundColor: '#6C63FF',
  },
  bookButtonTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  bookButtonSubtitle: {
    color: '#EAF4FF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextBox: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  infoText: {
    color: Colors.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
});
