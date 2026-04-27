import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Star, User, Mail, Lock, Phone, Baby, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v3zrj7cyl4nnc13f8gqyb';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [childFirstName, setChildFirstName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [secondChildFirstName, setSecondChildFirstName] = useState('');
  const [secondChildAge, setSecondChildAge] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const parentFullName = `${parentFirstName.trim()} ${parentLastName.trim()}`.trim();
    const childFullName = `${childFirstName.trim()} ${parentLastName.trim()}`.trim();
    const secondChildFullName = secondChildFirstName.trim()
      ? `${secondChildFirstName.trim()} ${parentLastName.trim()}`.trim()
      : undefined;

    if (
      !parentFirstName.trim() ||
      !parentLastName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password ||
      !confirmPassword ||
      !childFirstName.trim() ||
      !childAge.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const age = parseInt(childAge, 10);
    if (Number.isNaN(age) || age < 1 || age > 18) {
      Alert.alert('Error', 'Please enter a valid child age between 1 and 18');
      return;
    }

    if (secondChildFirstName.trim() && !secondChildAge.trim()) {
      Alert.alert('Error', 'Please enter age for the second child');
      return;
    }

    if (secondChildAge.trim() && !secondChildFirstName.trim()) {
      Alert.alert('Error', 'Please enter first name for the second child');
      return;
    }

    let age2: number | undefined;
    if (secondChildAge.trim()) {
      age2 = parseInt(secondChildAge, 10);
      if (Number.isNaN(age2) || age2 < 1 || age2 > 18) {
        Alert.alert('Error', 'Please enter a valid second child age between 1 and 18');
        return;
      }
    }

    setIsLoading(true);

    try {
      const cleanPhone = phoneNumber.startsWith('+961')
        ? phoneNumber
        : `+961${phoneNumber}`;

      const result = await register(
        parentFullName,
        username.trim(),
        email.trim(),
        password,
        cleanPhone,
        childFullName,
        age,
        secondChildFullName,
        age2
      );

      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/(home)') },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary, '#18324f', '#0b1728']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />

          <View style={styles.logoShell}>
            <View style={styles.logoRing}>
              <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.badge}>
            <ShieldCheck color={Colors.gold} size={15} />
            <Text style={styles.badgeText}>Parent Registration</Text>
          </View>

          <Text style={styles.title}>Join Gymnest</Text>
          <Text style={styles.subtitle}>Create your family profile and manage your child&apos;s classes.</Text>
        </LinearGradient>

        <View style={styles.formWrap}>
          <View style={styles.card}>
            <View style={styles.sectionHeaderCard}>
              <View>
                <Text style={styles.cardTitle}>Create Account</Text>
                <Text style={styles.cardSubtitle}>Required fields are marked with *</Text>
              </View>
              <View style={styles.miniBadge}>
                <Star color={Colors.gold} size={15} fill={Colors.gold} />
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Parent Information</Text>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><User color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Parent First Name *"
                  value={parentFirstName}
                  onChangeText={setParentFirstName}
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><User color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Family Name *"
                  value={parentLastName}
                  onChangeText={setParentLastName}
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><User color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Username *"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Mail color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Phone color={Colors.primary} size={19} /></View>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.phonePrefix}>+961</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Phone Number *"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.mediumGray}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Lock color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Lock color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Child Information</Text>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Baby color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Child First Name *"
                  value={childFirstName}
                  onChangeText={setChildFirstName}
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Baby color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Child Age *"
                  value={childAge}
                  onChangeText={setChildAge}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>
            </View>

            <View style={styles.sectionBlockLast}>
              <View style={styles.optionalHeader}>
                <Text style={styles.sectionTitle}>Second Child</Text>
                <Text style={styles.optionalText}>Optional</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Baby color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Second Child First Name"
                  value={secondChildFirstName}
                  onChangeText={setSecondChildFirstName}
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconBox}><Baby color={Colors.primary} size={19} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Second Child Age"
                  value={secondChildAge}
                  onChangeText={setSecondChildAge}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.86}
            >
              <LinearGradient
                colors={[Colors.gold, '#d6ad45', '#b98a1f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkTextBold}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 330,
    paddingTop: 66,
    paddingHorizontal: 24,
    paddingBottom: 72,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -90,
    right: -90,
  },
  logoShell: {
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  logoRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(212, 175, 55, 0.8)',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 7,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 310,
  },
  formWrap: {
    paddingHorizontal: 20,
    marginTop: -48,
    paddingBottom: 34,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 22,
    shadowColor: '#0b1728',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 9,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  miniBadge: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: {
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1f7',
    marginBottom: 14,
  },
  sectionBlockLast: {
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionalText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 98, 161, 0.09)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 0,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  phonePrefix: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '800',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 0,
  },
  registerButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  registerButtonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 22,
  },
  loginLinkText: {
    fontSize: 15,
    color: Colors.text,
  },
  loginLinkTextBold: {
    fontWeight: '800',
    color: Colors.gold,
  },
});
