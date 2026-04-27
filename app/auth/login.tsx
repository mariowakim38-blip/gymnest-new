import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const LOGO = require('@/assets/images/logo.jpeg');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      
      <View style={styles.logoContainer}>
        <Image source={LOGO} style={styles.logo} />
      </View>

      <Text style={styles.title}>Welcome Back</Text>

      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.link}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },

  link: {
    textAlign: 'center',
    marginTop: 15,
    color: Colors.primary,
  },
});
