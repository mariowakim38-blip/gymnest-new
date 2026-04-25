import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.center}>
        <Text>Login required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🔥 PREMIUM BACKGROUND */}
      <LinearGradient
        colors={['#1E3A5F', '#2A4D7A', '#1E3A5F']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* 🔥 INFO CARD */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Mail size={20} color={Colors.primary} />
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.value}>
            {user.phoneNumber || 'N/A'}
          </Text>
        </View>
      </View>

      {/* 🔥 CHILDREN */}
      {user.children?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>

          {user.children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {child.name.charAt(0)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} yrs</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 🔥 SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menu}>
          <Settings size={20} color={Colors.text} />
          <Text style={styles.menuText}>Account Settings</Text>
          <ChevronRight size={18} color={Colors.mediumGray} />
        </TouchableOpacity>
      </View>

      {/* 🔥 LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <LogOut size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },

  hero: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heroContent: {
    alignItems: 'center',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  role: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  value: {
    fontSize: 15,
    color: '#333',
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  childAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  childAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  childName: {
    fontSize: 15,
    fontWeight: '600',
  },

  childAge: {
    fontSize: 12,
    color: '#777',
  },

  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  menuText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  logout: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },

  logoutText: {
    color: '#ff4d4d',
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
