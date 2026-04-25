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
  Mail,
  Phone,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Save,
  Trash2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editChildren, setEditChildren] = useState<any[]>([]);

  const openEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phoneNumber || '');
    setEditChildren(user.children || []);
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    const result = await updateProfile(
      editName,
      editEmail,
      editPhone,
      editChildren
    );

    if (result.success) {
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const deleteChild = (index: number) => {
    const updated = editChildren.filter((_, i) => i !== index);
    setEditChildren(updated);
  };

  const updateChild = (index: number, key: string, value: any) => {
    const updated = [...editChildren];
    updated[index][key] = value;
    setEditChildren(updated);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.center}>
        <Text>Login required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* HERO */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#3b82f6']}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </LinearGradient>

      {/* INFO */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Mail size={20} color="#fff" />
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Phone size={20} color="#fff" />
          <Text style={styles.value}>{user.phoneNumber}</Text>
        </View>
      </View>

      {/* CHILDREN */}
      {user.children?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>

          {user.children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childAge}>{child.age} yrs</Text>
            </View>
          ))}
        </View>
      )}

      {/* SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menu} onPress={openEdit}>
          <Settings size={20} color="#fff" />
          <Text style={styles.menuText}>Account Settings</Text>
          <ChevronRight size={18} color="#aaa" />
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <LogOut size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Name"
              />

              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
              />

              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Phone"
              />

              {editChildren.map((child, i) => (
                <View key={i} style={styles.childEdit}>
                  <TextInput
                    style={styles.input}
                    value={child.name}
                    onChangeText={(v) => updateChild(i, 'name', v)}
                  />

                  <TextInput
                    style={styles.input}
                    value={child.age.toString()}
                    onChangeText={(v) =>
                      updateChild(i, 'age', parseInt(v) || 0)
                    }
                  />

                  <TouchableOpacity onPress={() => deleteChild(i)}>
                    <Trash2 color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Save color="#fff" />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}
