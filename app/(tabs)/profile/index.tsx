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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  hero: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: { fontSize: 30, fontWeight: 'bold' },

  name: { color: '#fff', fontSize: 20, marginTop: 10 },
  role: { color: '#aaa' },

  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },

  value: { color: '#fff' },

  section: { marginHorizontal: 16, marginTop: 20 },

  sectionTitle: { color: '#fff', marginBottom: 10 },

  childCard: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  childName: { color: '#fff' },
  childAge: { color: '#aaa' },

  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 10,
  },

  menuText: { flex: 1, marginLeft: 10, color: '#fff' },

  logout: {
    margin: 16,
    padding: 14,
    borderRadius: 10,
    borderColor: '#ff4d4d',
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  logoutText: { color: '#ff4d4d' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalTitle: { fontSize: 18, fontWeight: 'bold' },

  input: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },

  childEdit: { marginBottom: 10 },

  saveBtn: {
    backgroundColor: '#1e3a8a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  saveText: { color: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
