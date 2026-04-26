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
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editChildren, setEditChildren] = useState<any[]>([]);

  const openEdit = () => {
    if (!user) return;

    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phoneNumber || '');
    setEditChildren(user.children || []);
    setShowEditModal(true);
  };

  const addChild = () => {
    if (editChildren.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 children only.');
      return;
    }

    setEditChildren([
      ...editChildren,
      {
        id: `new-${Date.now()}`,
        name: '',
        age: 0,
      },
    ]);
  };

  const updateChild = (index: number, key: string, value: any) => {
    const updated = [...editChildren];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setEditChildren(updated);
  };

  const deleteChild = (index: number) => {
    Alert.alert('Remove Child', 'Are you sure you want to remove this child?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = editChildren.filter((_, i) => i !== index);
          setEditChildren(updated);
        },
      },
    ]);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Parent name is required.');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Valid email is required.');
      return;
    }

    if (!editPhone.trim()) {
      Alert.alert('Error', 'Phone number is required.');
      return;
    }

    const cleanedChildren = editChildren
      .filter((child) => child.name.trim())
      .map((child) => ({
        ...child,
        name: child.name.trim(),
        age: Number(child.age) || 0,
      }));

    const result = await updateProfile(
      editName.trim(),
      editEmail.trim(),
      editPhone.trim(),
      cleanedChildren
    );

    if (result.success) {
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile.');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Login required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#3b82f6']}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.row}>
          <Mail size={20} color="#fff" />
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Phone size={20} color="#fff" />
          <Text style={styles.value}>{user.phoneNumber || 'N/A'}</Text>
        </View>
      </View>

      {user.children?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>

          {user.children.map((child: any) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {child.name?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} yrs</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menu} onPress={openEdit}>
          <Settings size={20} color="#fff" />
          <Text style={styles.menuText}>Account Settings</Text>
          <ChevronRight size={18} color="#aaa" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <LogOut size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      <Modal visible={showEditModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Parent Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Parent name"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.modalSectionHeader}>
                <Text style={styles.modalSectionTitle}>Children</Text>
                <Text style={styles.childLimit}>{editChildren.length}/5</Text>
              </View>

              {editChildren.map((child, index) => (
                <View key={child.id || index} style={styles.childEditCard}>
                  <View style={styles.childEditHeader}>
                    <Text style={styles.childEditTitle}>
                      Child {index + 1}
                    </Text>

                    <TouchableOpacity
                      onPress={() => deleteChild(index)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Child Name</Text>
                  <TextInput
                    style={styles.input}
                    value={child.name}
                    onChangeText={(value) =>
                      updateChild(index, 'name', value)
                    }
                    placeholder="Child name"
                  />

                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={String(child.age || '')}
                    onChangeText={(value) =>
                      updateChild(index, 'age', parseInt(value, 10) || 0)
                    }
                    placeholder="Age"
                    keyboardType="number-pad"
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.addChildBtn,
                  editChildren.length >= 5 && styles.addChildBtnDisabled,
                ]}
                onPress={addChild}
                disabled={editChildren.length >= 5}
              >
                <Text style={styles.addChildText}>
                  + Add another child ({editChildren.length}/5)
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Save color="#fff" size={20} />
              <Text style={styles.saveText}>Save Changes</Text>
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
    backgroundColor: '#0f172a',
  },

  hero: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1e3a8a',
  },

  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },

  role: {
    color: '#cbd5e1',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 12,
  },

  card: {
    marginHorizontal: 16,
    marginTop: -34,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  value: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  childAvatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },

  childName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  childAge: {
    color: '#94a3b8',
    marginTop: 3,
  },

  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  logout: {
    marginTop: 28,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderColor: '#ef4444',
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '88%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    fontSize: 15,
    color: '#111827',
  },

  modalSectionHeader: {
    marginTop: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  childLimit: {
    color: '#2563eb',
    fontWeight: '900',
  },

  childEditCard: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  childEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  childEditTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },

  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },

  addChildBtn: {
    backgroundColor: '#eaf4ff',
    padding: 15,
    borderRadius: 14,
    marginVertical: 12,
    alignItems: 'center',
  },

  addChildBtnDisabled: {
    opacity: 0.5,
  },

  addChildText: {
    color: '#1e3a8a',
    fontWeight: '900',
    fontSize: 15,
  },

  saveBtn: {
    backgroundColor: '#1e3a8a',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerText: {
    color: '#fff',
  },
});
