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
import { useRouter, Href } from 'expo-router';
import { Mail, Lock, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v3zrj7cyl4nnc13f8gqyb';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        const destination = result.user?.role === 'admin' ? '/admin' : '/(tabs)/(home)';
        console.log('Login successful, navigating to:', destination);
        router.replace(destination as Href);
      } else {
        Alert.alert('Error', result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
            <Text style={styles.badgeText}>Secure Member Access</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your Gymnest account.</Text>
        </LinearGradient>

        <View style={styles.formWrap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In</Text>
            <Text style={styles.cardSubtitle}>Enter your details to continue.</Text>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Mail color={Colors.primary} size={19} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={Colors.mediumGray}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Lock color={Colors.primary} size={19} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={Colors.mediumGray}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.86}
            >
              <LinearGradient
                colors={[Colors.gold, '#d6ad45', '#b98a1f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>NEW TO GYMNEST?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/auth/register' as Href)}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>Create Parent Account</Text>
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
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -70,
    right: -80,
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
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(212, 175, 55, 0.8)',
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
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
  loginButton: {
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
  loginButtonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7ecf3',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.8,
  },
  registerButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
});
