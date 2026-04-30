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
import { User, Mail, Lock, Phone, Baby } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const LOGO = require('@/assets/images/logo.jpeg');

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Join Gymnest</Text>
          <Text style={styles.subtitle}>Create your parent account</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Parent Information</Text>

          <View style={styles.inputContainer}>
            <User color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Parent First Name *" value={parentFirstName} onChangeText={setParentFirstName} placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <User color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Family Name *" value={parentLastName} onChangeText={setParentLastName} placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <User color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Username *" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <Mail color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <Phone color={Colors.mediumGray} size={20} />
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.phonePrefix}>+961</Text>
              <TextInput style={styles.phoneInput} placeholder="Phone Number *" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor={Colors.mediumGray} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Lock color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <Lock color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Confirm Password *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor={Colors.mediumGray} />
          </View>

          <Text style={styles.sectionTitle}>Child Information</Text>

          <View style={styles.inputContainer}>
            <Baby color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Child First Name *" value={childFirstName} onChangeText={setChildFirstName} placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <Baby color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Child Age *" value={childAge} onChangeText={setChildAge} keyboardType="number-pad" placeholderTextColor={Colors.mediumGray} />
          </View>

          <Text style={styles.sectionTitle}>Second Child Optional</Text>

          <View style={styles.inputContainer}>
            <Baby color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Second Child First Name" value={secondChildFirstName} onChangeText={setSecondChildFirstName} placeholderTextColor={Colors.mediumGray} />
          </View>

          <View style={styles.inputContainer}>
            <Baby color={Colors.mediumGray} size={20} />
            <TextInput style={styles.input} placeholder="Second Child Age" value={secondChildAge} onChangeText={setSecondChildAge} keyboardType="number-pad" placeholderTextColor={Colors.mediumGray} />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[Colors.gold, '#c49b2e']} style={styles.registerButtonGradient}>
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkTextBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: Colors.gold },
  formContainer: { flex: 1, padding: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.text },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  phonePrefix: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginRight: 8,
  },
  phoneInput: { flex: 1, fontSize: 16, color: Colors.text },
  registerButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  loginLink: { alignItems: 'center', marginTop: 24 },
  loginLinkText: { fontSize: 16, color: Colors.text },
  loginLinkTextBold: { fontWeight: 'bold', color: Colors.gold },
});
