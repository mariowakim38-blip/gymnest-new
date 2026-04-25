import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import {
  User as UserIcon,
  Mail,
  Phone,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  Save,
  Trash2,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhoneNumber, setEditPhoneNumber] = useState<string>('');
  const [editChildren, setEditChildren] = useState<{ id: string; name: string; age: number }[]>([]);

const handleLogout = () => {
  Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Logout',
      style: 'destructive',
      onPress: async () => {
        try {
          console.log('Logging out...');

          await logout();

          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.localStorage.clear();
            window.sessionStorage.clear();
            window.location.replace('/auth/login');
            return;
          }

          router.replace('/auth/login' as Href);
        } catch (error) {
          console.log('Logout error:', error);

          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.localStorage.clear();
            window.sessionStorage.clear();
            window.location.replace('/auth/login');
            return;
          }

          router.replace('/auth/login' as Href);
        }
      },
    },
  ]);
};

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.removeItem('users');
          window.localStorage.removeItem('currentUser');
          window.localStorage.clear();
          window.location.href = '/';
        } else {
          router.replace('/auth/login' as Href);
        }
      },
    },
  ]);
};

  const openEditModal = () => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhoneNumber(user.phoneNumber ? user.phoneNumber.replace('+961', '') : '');
      setEditChildren(user.children || []);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!editPhoneNumber.trim()) {
      Alert.alert('Error', 'Phone number cannot be empty');
      return;
    }

    const result = await updateProfile(editName, editEmail, editPhoneNumber, editChildren);
    if (result.success) {
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  const updateChildName = (index: number, name: string) => {
    const updated = [...editChildren];
    updated[index] = { ...updated[index], name };
    setEditChildren(updated);
  };

  const updateChildAge = (index: number, age: string) => {
    const updated = [...editChildren];
    if (age === '') {
      updated[index] = { ...updated[index], age: 0 };
      setEditChildren(updated);
    } else {
      const ageNum = parseInt(age, 10);
      if (!isNaN(ageNum) && ageNum >= 0) {
        updated[index] = { ...updated[index], age: ageNum };
        setEditChildren(updated);
      }
    }
  };

  const deleteChild = (index: number) => {
    Alert.alert(
      'Delete Child',
      'Are you sure you want to remove this child from your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = editChildren.filter((_, i) => i !== index);
            setEditChildren(updated);
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <UserIcon color={Colors.mediumGray} size={64} />
          <Text style={styles.emptyStateTitle}>Not Logged In</Text>
          <Text style={styles.emptyStateText}>
            Please log in to view your profile
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login' as Href)}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    { id: '1', title: 'Account Settings', icon: Settings, route: null, action: openEditModal },
    { id: '2', title: 'Notifications', icon: Bell, route: null, action: null },
    { id: '3', title: 'Help & Support', icon: HelpCircle, route: null, action: null },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backgroundDecoration}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorTriangle} />
        <View style={styles.decorGlow} />
      </View>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userRole}>{user.role.toUpperCase()}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardShapes}>
          <View style={styles.infoCircle} />
        </View>
        <View style={styles.infoItem}>
          <Mail color={Colors.primary} size={20} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
        <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
          <Phone color={Colors.primary} size={20} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>
              {user.phoneNumber ? (user.phoneNumber.startsWith('+961') ? user.phoneNumber : `+961${user.phoneNumber}`) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {user.children && user.children.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          {user.children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} years old</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              if (item.action) {
                item.action();
              } else if (item.route) {
                router.push(item.route as Href);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <item.icon color={Colors.text} size={22} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <ChevronRight color={Colors.mediumGray} size={20} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LogOut color={Colors.error} size={22} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.mediumGray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.mediumGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.phonePrefix}>+961</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={editPhoneNumber}
                    onChangeText={setEditPhoneNumber}
                    placeholder="71177611"
                    placeholderTextColor={Colors.mediumGray}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {editChildren.map((child, index) => (
                <View key={child.id} style={styles.childEditContainer}>
                  <View style={styles.childEditHeader}>
                    <Text style={styles.childEditTitle}>
                      {index === 0 ? 'Child' : `Child ${index + 1}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteChild(index)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Trash2 color={Colors.error} size={20} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={child.name}
                      onChangeText={(text) => updateChildName(index, text)}
                      placeholder="Enter child name"
                      placeholderTextColor={Colors.mediumGray}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.input}
                      value={child.age === 0 ? '' : child.age.toString()}
                      onChangeText={(text) => updateChildAge(index, text)}
                      placeholder="Enter child age"
                      placeholderTextColor={Colors.mediumGray}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              activeOpacity={0.7}
            >
              <Save color={Colors.white} size={20} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative' as const,
  },
  backgroundDecoration: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  decorCircle1: {
    position: 'absolute' as const,
    top: -20,
    right: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 157, 0.15)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  decorCircle2: {
    position: 'absolute' as const,
    top: 200,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(157, 78, 221, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.15)',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  decorTriangle: {
    position: 'absolute' as const,
    top: 320,
    right: 20,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 35,
    borderRightWidth: 35,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 165, 0, 0.12)',
    transform: [{ rotate: '45deg' }],
  },
  decorGlow: {
    position: 'absolute' as const,
    top: 120,
    left: '45%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(43, 127, 191, 0.12)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gold,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  infoCardShapes: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
  },
  infoCircle: {
    position: 'absolute' as const,
    bottom: -35,
    right: -35,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 165, 0, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.12)',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  childAge: {
    fontSize: 14,
    color: Colors.textLight,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600' as const,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  phonePrefix: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
    paddingLeft: 16,
    paddingRight: 8,
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  childEditContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  childEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childEditTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});
