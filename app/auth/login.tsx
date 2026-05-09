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
import { User, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const LOGO = require('@/assets/images/logo.jpeg');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        const destination =
          result.user?.role === 'admin' ? '/admin' : '/(tabs)/(home)';

        router.replace(destination as Href);
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <LinearGradient colors={[Colors.primary, '#2a3f5f']} style={styles.header}>

          <View style={styles.logoCircle}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </LinearGradient>

        {/* FORM */}
        <View style={styles.formContainer}>

          <View style={styles.inputContainer}>
            <User color={Colors.mediumGray} size={20} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.mediumGray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color={Colors.mediumGray} size={20} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.mediumGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.gold, '#c49b2e']}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/auth/register' as Href)}
          >
            <Text style={styles.registerText}>
              Don’t have an account?{' '}
              <Text style={styles.registerBold}>Sign Up</Text>
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
    alignItems: 'center',
  },

  logoCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  subtitle: {
    fontSize: 14,
    color: Colors.gold,
    marginTop: 5,
  },

  formContainer: {
    padding: 24,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    marginLeft: 10,
  },

  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },

  loginButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  disabled: {
    opacity: 0.6,
  },

  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },

  registerText: {
    color: '#333',
  },

  registerBold: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
});
