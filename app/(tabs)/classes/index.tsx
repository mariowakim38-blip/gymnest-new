import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Sparkles, CalendarDays, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function ClassesScreen() {
  const router = useRouter();

  const openMonthlyBuilder = () => {
    router.push('/(tabs)/classes/monthly-plan' as Href);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.pill}>
          <Sparkles color={Colors.primary} size={15} />
          <Text style={styles.pillText}>Monthly Training Plans</Text>
        </View>

        <Text style={styles.title}>Build your child’s gymnastics schedule</Text>
        <Text style={styles.subtitle}>
          Choose a monthly package, select weekly training hours, then pick the start date.
        </Text>

        <TouchableOpacity style={styles.mainButton} onPress={openMonthlyBuilder} activeOpacity={0.88}>
          <View>
            <Text style={styles.mainButtonText}>Book a Class</Text>
            <Text style={styles.mainButtonSubtext}>Package • Weekly schedule • Start date</Text>
          </View>
          <ArrowRight color={Colors.white} size={23} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <CalendarDays color={Colors.primary} size={24} />
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoTitle}>How booking works</Text>
          <Text style={styles.infoText}>
            You will choose monthly hours first, then select the exact days and times your child will attend every week.
          </Text>
        </View>
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Important class rules</Text>

        <View style={styles.ruleRow}>
          <CheckCircle2 color={Colors.success} size={18} />
          <Text style={styles.ruleText}>Beginner class is 1 hour per day only.</Text>
        </View>

        <View style={styles.ruleRow}>
          <CheckCircle2 color={Colors.success} size={18} />
          <Text style={styles.ruleText}>Intermediate/Advanced can book multiple hours in the same day.</Text>
        </View>

        <View style={styles.ruleRow}>
          <CheckCircle2 color={Colors.success} size={18} />
          <Text style={styles.ruleText}>Calendar start date will only allow the days you selected.</Text>
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
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  pillText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textLight,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  mainButtonText: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  mainButtonSubtext: {
    color: '#EAF4FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    flexDirection: 'row',
    gap: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  infoText: {
    color: Colors.textLight,
    fontSize: 13,
    lineHeight: 19,
  },
  rulesCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5EAF1',
  },
  rulesTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  ruleText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});
