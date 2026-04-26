import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import { Users, Calendar, Trash2, Edit2, X, ClipboardCheck, Check, Search, Megaphone, Image as ImageIcon, UserCheck, Plus, Book, CalendarDays, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth, User } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { classes, Class } from '@/constants/mockData';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type TabType = 'users' | 'bookings' | 'attendance' | 'announcements' | 'gallery' | 'coaches' | 'classes' | 'events';

export default function AdminPanel() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('announcements');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassDate, setSelectedClassDate] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [searchDate, setSearchDate] = useState<string>('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>('');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('');
  const [selectedAttendanceClassKey, setSelectedAttendanceClassKey] = useState<string>('');

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [showMakeupModal, setShowMakeupModal] = useState<boolean>(false);
  const [makeupSearch, setMakeupSearch] = useState<string>('');
  const [selectedMakeupChild, setSelectedMakeupChild] = useState<any>(null);
  const [makeupNote, setMakeupNote] = useState<string>('');
  
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'info' as 'info' | 'event' | 'promotion', date: new Date().toISOString().split('T')[0] });
  
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<any>(null);
  const [galleryForm, setGalleryForm] = useState({ url: '', caption: '' });
  
  const [showCoachModal, setShowCoachModal] = useState<boolean>(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [coachForm, setCoachForm] = useState({ name: '', specialization: '', experience: '', bio: '', imageUrl: '', rating: 5.0 });

  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({ name: 'Gymnastics Class', ageGroup: '', level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', day: '', time: '', duration: '60 min', coachId: '', capacity: 30, enrolled: 0, description: '', dayOfWeek: 1 });

  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', type: 'Competition' as 'Competition' | 'Workshop' | 'Showcase' | 'Camp', description: '', location: '', imageUrl: '' });

  const [selectedBookingDay, setSelectedBookingDay] = useState<string | null>(null);
  const [selectedBookingClass, setSelectedBookingClass] = useState<any | null>(null);
  const [bookingSearch, setBookingSearch] = useState<string>('');

  const [selectedAttendanceWeekDay, setSelectedAttendanceWeekDay] = useState<string | null>(null);
  const [selectedAttendanceClassForDay, setSelectedAttendanceClassForDay] = useState<any | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState<string>('');
  const [showAttendanceDatePicker, setShowAttendanceDatePicker] = useState<boolean>(false);
  const [attendancePickerDate, setAttendancePickerDate] = useState<Date>(new Date());

  const [selectedClassesDay, setSelectedClassesDay] = useState<string | null>(null);
  const [adminClasses, setAdminClasses] = useState<any[]>([]);
  const [adminClassesLoading, setAdminClassesLoading] = useState<boolean>(false);
  const [adminClassesError, setAdminClassesError] = useState<any>(null);
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Log out of the admin panel?')) await logout();
      return;
    }
    Alert.alert('Logout', 'Log out of the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<any>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<any>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    class_id: '',
    status: 'confirmed' as 'confirmed' | 'cancelled',
  });

  const refreshUsers = async () => {
    if (!isAdmin) return;

    setUsersLoading(true);
    setUsersError(null);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Admin users fetch error:', profilesError);
      setUsersError(profilesError);
      setAllUsers([]);
      setUsersLoading(false);
      return;
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('*');

    if (childrenError) {
      console.error('Admin children fetch error:', childrenError);
    }

    const mappedUsers = (profiles ?? []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      name: profile.name ?? profile.full_name ?? 'Unnamed user',
      email: profile.email ?? '',
      phoneNumber: profile.phone_number ?? profile.phone ?? '',
      role: profile.role ?? 'parent',
      children: (childrenData ?? [])
        .filter((child: any) => child.profile_id === profile.id)
        .map((child: any) => ({
          id: child.id,
          name: child.name ?? 'Unnamed child',
          age: child.age ?? '',
        })),
    }));

    setAllUsers(mappedUsers);
    setUsersLoading(false);
  };

  const refreshBookings = async () => {
    if (!isAdmin) return;

    setBookingsLoading(true);
    setBookingsError(null);

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Admin bookings fetch error:', bookingsError);
      setBookingsError(bookingsError);
      setBookings([]);
      setBookingsLoading(false);
      return;
    }

    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name, age_group, day, time, duration');

    if (classesError) {
      console.error('Admin classes fetch error:', classesError);
    }

    const mappedBookings = (bookingsData ?? []).map((booking: any) => {
      const cls = (classesData ?? []).find(
        (c: any) => String(c.id) === String(booking.class_id)
      );

      return {
        id: booking.id,
        profileId: booking.profile_id,
        childId: booking.child_id,
        classId: booking.class_id,
        className: cls
          ? `${cls.name} - ${cls.age_group ?? ''}`
          : `Unknown Class (${booking.class_id})`,
        classDay: cls?.day ?? '',
        classTime: cls?.time ?? '',
        classDuration: cls?.duration ?? '',
        studentId: `${booking.profile_id}::${booking.child_id}`,
        bookingDate: booking.booking_date,
        classDate: booking.booking_date,
        status: booking.status ?? 'confirmed',
        attended: booking.attended,
        attendanceMarkedAt: booking.attendance_marked_at,
      };
    });

    setBookings(mappedBookings);
    setBookingsLoading(false);
  };

  const refreshAttendanceRecords = async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin attendance records fetch error:', error);
      setAttendanceRecords([]);
      return;
    }

    setAttendanceRecords(data ?? []);
  };

  const refreshAdminClasses = async () => {
    if (!isAdmin) return;

    setAdminClassesLoading(true);
    setAdminClassesError(null);

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error('Admin classes fetch error:', error);
      setAdminClassesError(error);
      setAdminClasses([]);
      setAdminClassesLoading(false);
      return;
    }

    setAdminClasses(data ?? []);
    setAdminClassesLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      refreshUsers();
      refreshBookings();
      refreshAnnouncements();
      refreshEvents();
      refreshAttendanceRecords();
      refreshAdminClasses();
    }
  }, [isAdmin]);
  const { data: privateSessions = [], isLoading: sessionsLoading, error: sessionsError, refetch: refreshSessions } = trpc.sessions.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState<boolean>(false);
  const [announcementsError, setAnnouncementsError] = useState<any>(null);

  const refreshAnnouncements = async () => {
    if (!isAdmin) return;

    setAnnouncementsLoading(true);
    setAnnouncementsError(null);

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Admin announcements fetch error:', error);
      setAnnouncementsError(error);
      setAnnouncements([]);
      setAnnouncementsLoading(false);
      return;
    }

    setAnnouncements(data ?? []);
    setAnnouncementsLoading(false);
  };
  const { data: galleryItems = [], isLoading: galleryLoading, error: galleryError, refetch: refreshGallery } = trpc.gallery.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const { data: dbCoaches = [], isLoading: coachesLoading, error: coachesError, refetch: refreshCoaches } = trpc.coaches.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const { data: dbClasses = [], isLoading: classesLoading, error: classesError, refetch: refreshClasses } = trpc.classes.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<any>(null);

  const refreshEvents = async () => {
    if (!isAdmin) return;

    setEventsLoading(true);
    setEventsError(null);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Admin events fetch error:', error);
      setEventsError(error);
      setDbEvents([]);
      setEventsLoading(false);
      return;
    }

    setDbEvents(data ?? []);
    setEventsLoading(false);
  };

  useEffect(() => {
    if (usersError) {
      console.error('=== tRPC Users Error ===');
      console.error('Error object:', usersError);
      console.error('Error message:', usersError.message);
      console.error('Error data:', usersError.data);
      console.error('Error shape:', usersError.shape);
      try {
        console.error('Error JSON:', JSON.stringify(usersError, null, 2));
      } catch {
        console.error('Could not stringify error');
      }
    }
  }, [usersError]);

  useEffect(() => {
    if (bookingsError) {
      console.error('=== tRPC Bookings Error ===');
      console.error('Error:', bookingsError.message);
    }
  }, [bookingsError]);

  useEffect(() => {
    if (announcementsError) {
      console.error('=== tRPC Announcements Error ===');
      console.error('Error:', announcementsError.message);
    }
  }, [announcementsError]);

  const updateUserMutation = trpc.users.update.useMutation({ onSuccess: () => refreshUsers() });
  const deleteUserMutation = trpc.users.delete.useMutation({ onSuccess: () => refreshUsers() });
  const cancelBookingMutation = trpc.bookings.cancel.useMutation({ onSuccess: () => refreshBookings() });
  const markAttendanceMutation = trpc.bookings.markAttendance.useMutation({ onSuccess: () => refreshBookings() });
  

  const createGalleryMutation = trpc.gallery.create.useMutation({ onSuccess: () => { refreshGallery(); setShowGalleryModal(false); } });
  const updateGalleryMutation = trpc.gallery.update.useMutation({ onSuccess: () => { refreshGallery(); setShowGalleryModal(false); } });
  const deleteGalleryMutation = trpc.gallery.delete.useMutation({ onSuccess: () => refreshGallery() });
  
  const createCoachMutation = trpc.coaches.create.useMutation({ onSuccess: () => { refreshCoaches(); setShowCoachModal(false); } });
  const updateCoachMutation = trpc.coaches.update.useMutation({ onSuccess: () => { refreshCoaches(); setShowCoachModal(false); } });
  const deleteCoachMutation = trpc.coaches.delete.useMutation({ onSuccess: () => refreshCoaches() });

  const createClassMutation = trpc.classes.create.useMutation({ onSuccess: () => { refreshClasses(); setShowClassModal(false); } });
  const updateClassMutation = trpc.classes.update.useMutation({ onSuccess: () => { refreshClasses(); setShowClassModal(false); } });
  const deleteClassMutation = trpc.classes.delete.useMutation({ onSuccess: () => refreshClasses() });



  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', `You do not have admin privileges.`);
      router.replace('/(tabs)/(home)' as any);
    }
  }, [user, router]);

  const handleDeleteUser = (userId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this user?')) {
        deleteUserMutation.mutate({ id: userId });
      }
    } else {
      Alert.alert('Delete User', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteUserMutation.mutate({ id: userId }) },
      ]);
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, phoneNumber: u.phoneNumber });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    await updateUserMutation.mutateAsync({ id: editingUser.id, name: editForm.name, phoneNumber: editForm.phoneNumber });
    setEditingUser(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    const cancelBooking = async () => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        const errorMessage = error.message || 'Failed to cancel booking';
        if (Platform.OS === 'web') alert(errorMessage);
        else Alert.alert('Error', errorMessage);
        return;
      }

      await refreshBookings();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this booking?')) cancelBooking();
    } else {
      Alert.alert('Cancel Booking', 'Are you sure?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: cancelBooking },
      ]);
    }
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
    setBookingForm({
      booking_date: booking.classDate || booking.bookingDate || '',
      class_id: booking.classId || '',
      status: booking.status === 'cancelled' ? 'cancelled' : 'confirmed',
    });
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;

    const cleanDate = bookingForm.booking_date.trim();
    const cleanClassId = bookingForm.class_id.trim();

    if (!cleanDate || !cleanClassId) {
      const msg = 'Booking date and class ID are required.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing information', msg);
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        booking_date: cleanDate,
        class_id: cleanClassId,
        status: bookingForm.status,
      })
      .eq('id', editingBooking.id);

    if (error) {
      const errorMessage = error.message || 'Failed to update booking';
      if (Platform.OS === 'web') alert(errorMessage);
      else Alert.alert('Error', errorMessage);
      return;
    }

    await refreshBookings();
    setEditingBooking(null);
  };

  const handleMarkAttendance = async (bookingId: string, attended: boolean) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        attended,
        attendance_marked_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Attendance update error:', error);
      Alert.alert('Attendance Error', error.message);
      return;
    }

    await refreshBookings();
  };

  const makeupChildOptions = allUsers
    .flatMap((u: any) =>
      (u.children || []).map((child: any) => ({
        ...child,
        profile_id: u.id,
        parentName: u.name,
      }))
    )
    .filter((child: any) =>
      makeupSearch.trim()
        ? String(child.name || '').toLowerCase().includes(makeupSearch.toLowerCase()) ||
          String(child.parentName || '').toLowerCase().includes(makeupSearch.toLowerCase())
        : true
    );

  const handleOpenMakeupModal = () => {
    setMakeupSearch('');
    setSelectedMakeupChild(null);
    setMakeupNote('');
    setShowMakeupModal(true);
  };

  const handleAddMakeupStudent = async () => {
    if (!selectedMakeupChild || !selectedAttendanceClass || !selectedAttendanceDate) {
      const msg = 'Select a student before adding make-up attendance.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing student', msg);
      return;
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        profile_id: selectedMakeupChild.profile_id,
        child_id: selectedMakeupChild.id,
        attended_class_id: selectedAttendanceClass.classId,
        attended_date: selectedAttendanceDate,
        attendance_type: 'makeup',
        status: 'present',
        note: makeupNote.trim() || 'Make-up class',
      })
      .select()
      .single();

    if (error) {
      const errorMessage = error.message || 'Failed to add make-up student.';
      if (Platform.OS === 'web') alert(errorMessage);
      else Alert.alert('Error', errorMessage);
      return;
    }

    if (data) {
      setAttendanceRecords((prev) => [data, ...prev]);
    }

    setShowMakeupModal(false);
    setSelectedMakeupChild(null);
    setMakeupSearch('');
    setMakeupNote('');
  };

  const handleDeleteMakeupRecord = async (recordId: string) => {
    const deleteRecord = async () => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', recordId);

      if (error) {
        const errorMessage = error.message || 'Failed to remove make-up student.';
        if (Platform.OS === 'web') alert(errorMessage);
        else Alert.alert('Error', errorMessage);
        return;
      }

      setAttendanceRecords((prev) => prev.filter((record) => record.id !== recordId));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Remove this make-up student from attendance?')) deleteRecord();
    } else {
      Alert.alert('Remove student', 'Remove this make-up student from attendance?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: deleteRecord },
      ]);
    }
  };

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', message: '', type: 'info', date: new Date().toISOString().split('T')[0] });
    setShowAnnouncementModal(true);
  };

  const handleEditAnnouncement = (item: any) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({ title: item.title, message: item.message, type: item.type, date: item.date });
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async () => {
    try {
      const cleanTitle = announcementForm.title.trim();
      const cleanMessage = announcementForm.message.trim();
      const cleanDate = announcementForm.date.trim();

      if (!cleanTitle || !cleanMessage || !cleanDate) {
        const msg = 'Title, message, and date are required.';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Missing information', msg);
        return;
      }

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: cleanTitle,
            message: cleanMessage,
            type: announcementForm.type,
            date: cleanDate,
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: cleanTitle,
            message: cleanMessage,
            type: announcementForm.type,
            date: cleanDate,
          });

        if (error) throw error;
      }

      await refreshAnnouncements();
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      console.log('Announcement saved directly to Supabase');
    } catch (error) {
      console.error('Failed to save announcement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save announcement';
      if (Platform.OS === 'web') alert(errorMessage);
      else Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    const deleteAnnouncement = async () => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        const errorMessage = error.message || 'Failed to delete announcement';
        if (Platform.OS === 'web') alert(errorMessage);
        else Alert.alert('Error', errorMessage);
        return;
      }

      await refreshAnnouncements();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this announcement?')) deleteAnnouncement();
    } else {
      Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteAnnouncement },
      ]);
    }
  };

  const handleAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ url: '', caption: '' });
    setShowGalleryModal(true);
  };

  const handleEditGallery = (item: any) => {
    setEditingGalleryItem(item);
    setGalleryForm({ url: item.url, caption: item.caption });
    setShowGalleryModal(true);
  };

  const handleSaveGallery = async () => {
    try {
      if (editingGalleryItem) {
        await updateGalleryMutation.mutateAsync({ id: editingGalleryItem.id, ...galleryForm });
      } else {
        await createGalleryMutation.mutateAsync(galleryForm);
      }
      console.log('Gallery item saved successfully');
    } catch (error) {
      console.error('Failed to save gallery item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save gallery item';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleDeleteGallery = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this image?')) deleteGalleryMutation.mutate({ id });
    } else {
      Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteGalleryMutation.mutate({ id }) },
      ]);
    }
  };

  const handleAddCoach = () => {
    setEditingCoach(null);
    setCoachForm({ name: '', specialization: '', experience: '', bio: '', imageUrl: '', rating: 5.0 });
    setShowCoachModal(true);
  };

  const handleEditCoach = (item: any) => {
    setEditingCoach(item);
    const imageUrl = 'image_url' in item ? item.image_url : item.imageUrl;
    setCoachForm({ name: item.name, specialization: item.specialization, experience: item.experience, bio: item.bio, imageUrl, rating: item.rating });
    setShowCoachModal(true);
  };

  const handleSaveCoach = async () => {
    try {
      if (editingCoach) {
        await updateCoachMutation.mutateAsync({ id: editingCoach.id, ...coachForm });
      } else {
        await createCoachMutation.mutateAsync(coachForm);
      }
      console.log('Coach saved successfully');
    } catch (error) {
      console.error('Failed to save coach:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save coach';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleDeleteCoach = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this coach?')) deleteCoachMutation.mutate({ id });
    } else {
      Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCoachMutation.mutate({ id }) },
      ]);
    }
  };

  const getDayOfWeekNumber = (day: string) => {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayMap[String(day || '').trim().toLowerCase()] ?? 1;
  };

  const handleAddClass = () => {
    const defaultDay = selectedClassesDay || 'Monday';
    setEditingClass(null);
    setClassForm({
      name: 'Gymnastics Class',
      ageGroup: '',
      level: 'Beginner',
      day: defaultDay,
      time: '',
      duration: '60 min',
      coachId: '',
      capacity: 30,
      enrolled: 0,
      description: '',
      dayOfWeek: getDayOfWeekNumber(defaultDay),
    });
    setShowClassModal(true);
  };

  const handleEditClass = (item: any) => {
    setEditingClass(item);

    const ageGroup = 'age_group' in item ? item.age_group : item.ageGroup;
    const coachId = 'coach_id' in item ? item.coach_id : item.coachId;
    const rawDayOfWeek = 'day_of_week' in item ? item.day_of_week : item.dayOfWeek;
    const dayOfWeek = Number.isFinite(Number(rawDayOfWeek)) ? Number(rawDayOfWeek) : getDayOfWeekNumber(item.day);

    setClassForm({
      name: String(item.name ?? ''),
      ageGroup: String(ageGroup ?? ''),
      level: (item.level ?? 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
      day: String(item.day ?? ''),
      time: String(item.time ?? ''),
      duration: String(item.duration ?? '60 min'),
      coachId: String(coachId ?? ''),
      capacity: Number(item.capacity) || 30,
      enrolled: Number(item.enrolled) || 0,
      description: String(item.description ?? ''),
      dayOfWeek,
    });
    setShowClassModal(true);
  };

  const handleSaveClass = async () => {
    try {
      const cleanName = String(classForm.name ?? '').trim();
      const cleanAgeGroup = String(classForm.ageGroup ?? '').trim();
      const cleanDay = String(classForm.day ?? '').trim();
      const cleanTime = String(classForm.time ?? '').trim();
      const cleanDuration = String(classForm.duration ?? '').trim();
      const cleanDescription = String(classForm.description ?? '').trim();
      const cleanCoachId = String(classForm.coachId ?? '').trim();

      if (!cleanName || !cleanAgeGroup || !cleanDay || !cleanTime || !cleanDuration) {
        const msg = 'Name, age group, day, time, and duration are required.';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Missing information', msg);
        return;
      }

      const payload = {
        name: cleanName,
        age_group: cleanAgeGroup,
        level: classForm.level,
        day: cleanDay,
        time: cleanTime,
        duration: cleanDuration,
        coach_id: cleanCoachId || null,
        capacity: Number(classForm.capacity) || 30,
        enrolled: Number(classForm.enrolled) || 0,
        description: cleanDescription || null,
        day_of_week: getDayOfWeekNumber(cleanDay),
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(payload)
          .eq('id', editingClass.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert(payload);

        if (error) throw error;
      }

      await refreshAdminClasses();
      await refreshBookings();
      setShowClassModal(false);
      setEditingClass(null);
      console.log('Class saved directly to Supabase');
    } catch (error) {
      console.error('Failed to save class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save class';
      if (Platform.OS === 'web') alert(errorMessage);
      else Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteClass = (id: string) => {
    const deleteClass = async () => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        const errorMessage = error.message || 'Failed to delete class';
        if (Platform.OS === 'web') alert(errorMessage);
        else Alert.alert('Error', errorMessage);
        return;
      }

      await refreshAdminClasses();
      await refreshBookings();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this class?')) deleteClass();
    } else {
      Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteClass },
      ]);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', date: '', time: '', type: 'Competition', description: '', location: '', imageUrl: '' });
    setShowEventModal(true);
  };

  const handleEditEvent = (item: any) => {
    setEditingEvent(item);
    const imageUrl = 'image_url' in item ? item.image_url : item.imageUrl;
    setEventForm({ title: item.title, date: item.date, time: item.time, type: item.type, description: item.description, location: item.location, imageUrl });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      const cleanTitle = eventForm.title.trim();
      const cleanDate = eventForm.date.trim();
      const cleanTime = eventForm.time.trim();
      const cleanDescription = eventForm.description.trim();
      const cleanLocation = eventForm.location.trim();
      const cleanImageUrl = eventForm.imageUrl.trim();

      if (!cleanTitle || !cleanDate || !cleanTime || !cleanDescription || !cleanLocation) {
        const msg = 'Title, date, time, description, and location are required.';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Missing information', msg);
        return;
      }

      const payload = {
        title: cleanTitle,
        date: cleanDate,
        time: cleanTime,
        type: eventForm.type,
        description: cleanDescription,
        location: cleanLocation,
        image_url: cleanImageUrl || null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert(payload);

        if (error) throw error;
      }

      await refreshEvents();
      setShowEventModal(false);
      setEditingEvent(null);
      console.log('Event saved directly to Supabase');
    } catch (error) {
      console.error('Failed to save event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      if (Platform.OS === 'web') alert(errorMessage);
      else Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const deleteEvent = async () => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        const errorMessage = error.message || 'Failed to delete event';
        if (Platform.OS === 'web') alert(errorMessage);
        else Alert.alert('Error', errorMessage);
        return;
      }

      await refreshEvents();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this event?')) deleteEvent();
    } else {
      Alert.alert('Delete', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteEvent },
      ]);
    }
  };

  const getClassName = (classId: string) => {
    const cls: any = getSourceClasses().find((c: any) => String(c.id) === String(classId));
    if (!cls) return 'Unknown Class';
    const ageGroup = cls.age_group ?? cls.ageGroup ?? '';
    return `${cls.name} - ${ageGroup}`;
  };

  const getClassDates = (classId: string) => {
    const classBookings = bookings.filter(b => b.classId === classId && b.status !== 'cancelled');
    const uniqueDates = Array.from(new Set(classBookings.map(b => b.classDate)));
    return uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const filterClassesByDate = () => {
    const sourceClasses = getSourceClasses();
    if (!searchDate.trim()) return sourceClasses as any[];
    return (sourceClasses as any[]).filter((cls: any) => {
      const classDates = getClassDates(cls.id);
      return classDates.some((date: string) => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return formattedDate.toLowerCase().includes(searchDate.toLowerCase()) || date.includes(searchDate);
      });
    });
  };

  const getBookingsForClassDate = (classId: string, classDate: string) => {
    return bookings.filter(b => b.classId === classId && b.status !== 'cancelled' && b.classDate === classDate);
  };

  const safeDate = (dateString: string) => {
    if (!dateString) return new Date();
    return new Date(`${dateString}T12:00:00`);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAttendanceDate = (dateString: string) => {
    const d = safeDate(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSourceClasses = () => (adminClasses.length > 0 ? adminClasses : classes) as any[];

  const getClassesForDay = (day: string | null) => {
    if (!day) return [];
    return getSourceClasses().filter(
      (cls: any) => String(cls.day || '').toLowerCase() === day.toLowerCase()
    );
  };

  const getParentForBooking = (booking: any) => {
    return allUsers.find(
      (u: any) =>
        String(u.id) === String(booking.profileId) ||
        String(u.userId) === String(booking.profileId)
    );
  };

  const getChildForBooking = (booking: any) => {
    const parent = getParentForBooking(booking);
    return parent?.children?.find((child: any) => String(child.id) === String(booking.childId));
  };

  const getUniqueStudentCount = (items: any[]) => {
    return new Set(items.map((booking: any) => `${booking.profileId || ''}::${booking.childId || ''}`)).size;
  };

  const normalizeText = (value: any) => String(value ?? '').toLowerCase().trim();

  const getClassById = (classId: any) => {
    return getSourceClasses().find((cls: any) => String(cls.id) === String(classId));
  };

  const isSameClass = (booking: any, cls: any) => {
    if (!booking || !cls) return false;

    const bookingClassId = String(booking.classId ?? '').trim();
    const classId = String(cls.id ?? '').trim();

    if (bookingClassId && classId && bookingClassId === classId) return true;

    const bookingDay = normalizeText(booking.classDay);
    const classDay = normalizeText(cls.day);
    const bookingTime = normalizeText(booking.classTime);
    const classTime = normalizeText(cls.time);

    return !!bookingDay && !!classDay && !!bookingTime && !!classTime && bookingDay === classDay && bookingTime === classTime;
  };

  const getBookingsForClass = (classOrId: any) => {
    const cls = typeof classOrId === 'object' ? classOrId : getClassById(classOrId);

    return bookings.filter(
      (booking: any) =>
        booking.status !== 'cancelled' &&
        isSameClass(booking, cls)
    );
  };

  const getBookingDateKey = (booking: any) => String(booking.classDate || booking.bookingDate || '').trim();

  const getBookingsForClassOnDate = (classOrId: any, date?: string) => {
    const selectedDate = String(date || '').trim();
    const classBookings = getBookingsForClass(classOrId);

    if (!selectedDate) return classBookings;

    return classBookings.filter(
      (booking: any) => getBookingDateKey(booking) === selectedDate
    );
  };

  const getStudentBookingGroupsForClass = (classOrId: any) => {
    const grouped = getBookingsForClass(classOrId).reduce((acc: any, booking: any) => {
      const key = `${booking.profileId || ''}::${booking.childId || ''}`;

      if (!acc[key]) {
        acc[key] = {
          key,
          profileId: booking.profileId,
          childId: booking.childId,
          bookings: [],
        };
      }

      acc[key].bookings.push(booking);
      return acc;
    }, {});

    return Object.values(grouped).map((group: any) => ({
      ...group,
      bookings: group.bookings.sort((a: any, b: any) => safeDate(getBookingDateKey(a)).getTime() - safeDate(getBookingDateKey(b)).getTime()),
    }));
  };

  const getWeekdayFromDateString = (dateString: string) => {
    return safeDate(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const setAttendanceDateFromDate = (date: Date) => {
    const dateString = formatDateForInput(date);
    setAttendancePickerDate(safeDate(dateString));
    setAttendanceDateFilter(dateString);
    setSelectedAttendanceDate(dateString);
    setSelectedAttendanceWeekDay(getWeekdayFromDateString(dateString));
    setSelectedAttendanceClassForDay(null);
  };

  const attendanceDays = Object.values(
    bookings
      .filter((booking: any) => booking.status !== 'cancelled' && booking.classDate)
      .reduce((acc: any, booking: any) => {
        const dateKey = booking.classDate;

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            classes: {},
            totalStudents: 0,
          };
        }

        const classKey = `${booking.classId}-${booking.classTime || 'no-time'}`;
        if (!acc[dateKey].classes[classKey]) {
          acc[dateKey].classes[classKey] = {
            key: classKey,
            classId: booking.classId,
            className: booking.className ?? getClassName(booking.classId),
            classTime: booking.classTime ?? '',
            classDuration: booking.classDuration ?? '',
            bookings: [],
          };
        }

        acc[dateKey].classes[classKey].bookings.push(booking);
        acc[dateKey].totalStudents += 1;
        return acc;
      }, {})
  ).sort((a: any, b: any) => safeDate(a.date).getTime() - safeDate(b.date).getTime()) as any[];

  const visibleAttendanceDays = selectedAttendanceDate
    ? attendanceDays.filter((day: any) => day.date === selectedAttendanceDate)
    : attendanceDays;

  const selectedAttendanceDay = selectedAttendanceDate
    ? attendanceDays.find((day: any) => day.date === selectedAttendanceDate)
    : null;

  const selectedAttendanceClasses = selectedAttendanceDay
    ? Object.values(selectedAttendanceDay.classes).sort((a: any, b: any) => String(a.classTime).localeCompare(String(b.classTime))) as any[]
    : [];

  const selectedAttendanceClass = selectedAttendanceClassKey
    ? selectedAttendanceClasses.find((cls: any) => cls.key === selectedAttendanceClassKey)
    : null;

  const selectedAttendanceClassMakeupRecords =
    selectedAttendanceClass && selectedAttendanceDate
      ? attendanceRecords.filter(
          (record: any) =>
            record.attendance_type === 'makeup' &&
            record.status !== 'deleted' &&
            record.attended_date === selectedAttendanceDate &&
            String(record.attended_class_id) === String(selectedAttendanceClass.classId)
        )
      : [];

  if (user?.role !== 'admin') return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Admin Panel',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => (
            <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut color={Colors.white} size={18} />
              <Text style={styles.headerLogoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.sidebar}>
          <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={[styles.tab, activeTab === 'announcements' && styles.tabActive]} onPress={() => setActiveTab('announcements')}>
              <Megaphone color={activeTab === 'announcements' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'announcements' && styles.tabTextActive]}>Announcements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'gallery' && styles.tabActive]} onPress={() => setActiveTab('gallery')}>
              <ImageIcon color={activeTab === 'gallery' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'gallery' && styles.tabTextActive]}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'coaches' && styles.tabActive]} onPress={() => setActiveTab('coaches')}>
              <UserCheck color={activeTab === 'coaches' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'coaches' && styles.tabTextActive]}>Coaches</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'classes' && styles.tabActive]} onPress={() => setActiveTab('classes')}>
              <Book color={activeTab === 'classes' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'classes' && styles.tabTextActive]}>Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'events' && styles.tabActive]} onPress={() => setActiveTab('events')}>
              <CalendarDays color={activeTab === 'events' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'users' && styles.tabActive]} onPress={() => setActiveTab('users')}>
              <Users color={activeTab === 'users' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'bookings' && styles.tabActive]} onPress={() => setActiveTab('bookings')}>
              <Calendar color={activeTab === 'bookings' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, activeTab === 'attendance' && styles.tabActive]} onPress={() => setActiveTab('attendance')}>
              <ClipboardCheck color={activeTab === 'attendance' ? Colors.white : Colors.primary} size={20} />
              <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, styles.logoutTab]} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut color={Colors.danger} size={20} />
              <Text style={[styles.tabText, styles.logoutTabText]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView style={styles.content}>
        {activeTab === 'announcements' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Announcements</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddAnnouncement}>
                <Plus color={Colors.white} size={20} />
              </TouchableOpacity>
            </View>
            {announcements.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.announcementInfo}>
                    <Text style={styles.announcementTitle}>{item.title}</Text>
                    <Text style={styles.announcementMessage}>{item.message}</Text>
                    <View style={[styles.typeBadge, item.type === 'promotion' && styles.typePromotion, item.type === 'event' && styles.typeEvent]}>
                      <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleEditAnnouncement(item)}>
                      <Edit2 color={Colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteAnnouncement(item.id)}>
                      <Trash2 color={Colors.danger} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'gallery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddGallery}>
                <Plus color={Colors.white} size={20} />
              </TouchableOpacity>
            </View>
            {galleryItems.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.galleryInfo}>
                    <Text style={styles.galleryUrl} numberOfLines={1}>{item.url}</Text>
                    <Text style={styles.galleryCaption}>{item.caption}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleEditGallery(item)}>
                      <Edit2 color={Colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteGallery(item.id)}>
                      <Trash2 color={Colors.danger} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'coaches' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Coaches</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddCoach}>
                <Plus color={Colors.white} size={20} />
              </TouchableOpacity>
            </View>
            {dbCoaches.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.coachInfo}>
                    <Text style={styles.coachName}>{item.name}</Text>
                    <Text style={styles.coachDetail}>{item.specialization}</Text>
                    <Text style={styles.coachDetail}>{item.experience}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleEditCoach(item)}>
                      <Edit2 color={Colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteCoach(item.id)}>
                      <Trash2 color={Colors.danger} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'classes' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Classes</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.smallActionButton}
                  onPress={() => refreshAdminClasses()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.smallActionButtonText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={handleAddClass}>
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {adminClassesLoading && (
              <Text style={styles.emptyStateText}>Loading classes...</Text>
            )}

            {!adminClassesLoading && !selectedClassesDay && (
              <View>
                <Text style={styles.attendanceStepTitle}>Select a day</Text>

                <View style={styles.attendanceDayGrid}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                    const dayClasses = getSourceClasses().filter(
                      (cls: any) => String(cls.day).toLowerCase() === day.toLowerCase()
                    );

                    return (
                      <TouchableOpacity
                        key={day}
                        style={styles.attendanceDayCard}
                        onPress={() => setSelectedClassesDay(day)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.attendanceDayTitle}>{day}</Text>
                        <Text style={styles.attendanceDayCount}>{dayClasses.length} classes</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {!adminClassesLoading && selectedClassesDay && (
              <View>
                <TouchableOpacity
                  style={styles.backToClassesButton}
                  onPress={() => setSelectedClassesDay(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToClassesText}>← Back to days</Text>
                </TouchableOpacity>

                <Text style={styles.attendanceStepTitle}>{selectedClassesDay} Classes</Text>

                {getSourceClasses()
                  .filter((item: any) => String(item.day).toLowerCase() === selectedClassesDay.toLowerCase())
                  .sort((a: any, b: any) => String(a.time).localeCompare(String(b.time)))
                  .map((item: any) => {
                    const ageGroup = item.age_group ?? item.ageGroup ?? '';

                    return (
                      <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <View style={styles.classInfo}>
                            <Text style={styles.className}>{item.name} - {ageGroup}</Text>
                            <Text style={styles.classDetail}>{item.day} {item.time} ({item.duration})</Text>
                            <Text style={styles.classDetail}>{item.level} - {item.enrolled}/{item.capacity} enrolled</Text>
                          </View>

                          <View style={styles.cardActions}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleEditClass(item)}>
                              <Edit2 color={Colors.primary} size={20} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteClass(item.id)}>
                              <Trash2 color={Colors.danger} size={20} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                {getSourceClasses().filter(
                  (item: any) => String(item.day).toLowerCase() === selectedClassesDay.toLowerCase()
                ).length === 0 && (
                  <Text style={styles.emptyStateText}>No classes available on {selectedClassesDay}.</Text>
                )}
              </View>
            )}
          </View>
        )}
        {activeTab === 'events' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Events</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                <Plus color={Colors.white} size={20} />
              </TouchableOpacity>
            </View>
            {(dbEvents || []).map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDetail}>{item.date} at {item.time}</Text>
                    <Text style={styles.eventDetail}>{item.type} - {item.location}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleEditEvent(item)}>
                      <Edit2 color={Colors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteEvent(item.id)}>
                      <Trash2 color={Colors.danger} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Users</Text>
            {usersLoading ? (
              <Text style={styles.emptyStateText}>Loading...</Text>
            ) : allUsers.length === 0 ? (
              <Text style={styles.emptyStateText}>No users found</Text>
            ) : (
              allUsers.map((u) => (
                <View key={u.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <Text style={styles.userRole}>{u.role}</Text>
                      <Text style={styles.userDetail}>{u.email}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.iconButton} onPress={() => handleEditUser(u)}>
                        <Edit2 color={Colors.primary} size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteUser(u.id)}>
                        <Trash2 color={Colors.danger} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'bookings' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Bookings</Text>
                <Text style={styles.attendanceSubtitle}>Choose a day, choose a class, then manage the booked students.</Text>
              </View>
              <TouchableOpacity
                style={styles.smallActionButton}
                onPress={() => refreshBookings()}
                activeOpacity={0.8}
              >
                <Text style={styles.smallActionButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search student or parent..."
              style={styles.input}
              value={bookingSearch}
              onChangeText={setBookingSearch}
            />

            {bookingsLoading ? (
              <Text style={styles.emptyStateText}>Loading bookings...</Text>
            ) : !selectedBookingDay ? (
              <View>
                <Text style={styles.attendanceStepTitle}>Select a day</Text>
                <View style={styles.attendanceDayGrid}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                    const dayClasses = getClassesForDay(day);
                    const dayBookings = bookings.filter(
                      (booking: any) =>
                        booking.status !== 'cancelled' &&
                        String(booking.classDay).toLowerCase() === day.toLowerCase()
                    );
                    const uniqueStudentCount = getUniqueStudentCount(dayBookings);

                    return (
                      <TouchableOpacity
                        key={day}
                        style={styles.attendanceDayCard}
                        onPress={() => {
                          setSelectedBookingDay(day);
                          setSelectedBookingClass(null);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.attendanceDayTitle}>{day}</Text>
                        <Text style={styles.attendanceDayCount}>{dayClasses.length} classes • {uniqueStudentCount} students</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : selectedBookingDay && !selectedBookingClass ? (
              <View>
                <TouchableOpacity
                  style={styles.backToClassesButton}
                  onPress={() => {
                    setSelectedBookingDay(null);
                    setSelectedBookingClass(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToClassesText}>← Back to days</Text>
                </TouchableOpacity>

                <Text style={styles.attendanceStepTitle}>{selectedBookingDay} Classes</Text>

                <View style={styles.attendanceClassGrid}>
                  {getClassesForDay(selectedBookingDay)
                    .sort((a: any, b: any) => String(a.time).localeCompare(String(b.time)))
                    .map((cls: any) => {
                      const classBookings = getBookingsForClass(cls);
                      const uniqueStudentCount = getUniqueStudentCount(classBookings);

                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.attendanceClassCard}
                          onPress={() => setSelectedBookingClass(cls)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.attendanceClassName}>{cls.name} - {cls.age_group || cls.ageGroup || ''}</Text>
                          <Text style={styles.attendanceClassTime}>{cls.time || 'No time'}{cls.duration ? ` • ${cls.duration}` : ''}</Text>
                          <Text style={styles.attendanceClassCount}>{uniqueStudentCount} students booked</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>

                {getClassesForDay(selectedBookingDay).length === 0 && (
                  <Text style={styles.emptyStateText}>No classes available on {selectedBookingDay}.</Text>
                )}
              </View>
            ) : selectedBookingClass ? (
              <View>
                <TouchableOpacity
                  style={styles.backToClassesButton}
                  onPress={() => setSelectedBookingClass(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToClassesText}>← Back to classes</Text>
                </TouchableOpacity>

                <View style={styles.attendanceSelectedHeader}>
                  <View>
                    <Text style={styles.attendanceStepTitle}>{selectedBookingDay}</Text>
                    <Text style={styles.attendanceClassName}>{selectedBookingClass.name} - {selectedBookingClass.age_group || selectedBookingClass.ageGroup || ''}</Text>
                    <Text style={styles.attendanceClassTime}>{selectedBookingClass.time || 'No time'}{selectedBookingClass.duration ? ` • ${selectedBookingClass.duration}` : ''}</Text>
                  </View>
                </View>

                {getStudentBookingGroupsForClass(selectedBookingClass)
                  .filter((group: any) => {
                    const firstBooking = group.bookings[0];
                    const parent = getParentForBooking(firstBooking);
                    const child = getChildForBooking(firstBooking);
                    const search = bookingSearch.trim().toLowerCase();
                    if (!search) return true;
                    return (
                      String(parent?.name || '').toLowerCase().includes(search) ||
                      String(parent?.phoneNumber || '').toLowerCase().includes(search) ||
                      String(child?.name || '').toLowerCase().includes(search)
                    );
                  })
                  .map((group: any) => {
                    const firstBooking = group.bookings[0];
                    const parent = getParentForBooking(firstBooking);
                    const child = getChildForBooking(firstBooking);

                    return (
                      <View key={group.key} style={styles.attendanceStudentCard}>
                        <View style={styles.attendanceStudentInfo}>
                          <Text style={styles.attendanceName}>{child?.name || 'Unknown student'}</Text>
                          <Text style={styles.attendanceParent}>Parent: {parent?.name || 'Unknown parent'}</Text>
                          {!!parent?.phoneNumber && <Text style={styles.attendanceStatus}>Phone: {parent.phoneNumber}</Text>}

                          <View style={styles.bookingDatesWrap}>
                            {group.bookings.map((booking: any) => (
                              <View key={booking.id} style={styles.bookingDatePill}>
                                <Text style={styles.bookingDatePillText}>
                                  {getBookingDateKey(booking) ? formatAttendanceDate(getBookingDateKey(booking)) : 'No date'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={styles.attendanceActions}>
                          <TouchableOpacity
                            style={styles.bookingEditButton}
                            onPress={() => handleEditBooking(firstBooking)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.bookingEditButtonText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.bookingCancelButton}
                            onPress={() => handleCancelBooking(firstBooking.id)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.bookingCancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                {getStudentBookingGroupsForClass(selectedBookingClass).length === 0 && (
                  <Text style={styles.emptyStateText}>No bookings available for this class.</Text>
                )}
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'attendance' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Attendance</Text>
                <Text style={styles.attendanceSubtitle}>Pick a date, choose the class, then mark attendance.</Text>
              </View>
              <TouchableOpacity
                style={styles.smallActionButton}
                onPress={() => {
                  refreshBookings();
                  refreshAttendanceRecords();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.smallActionButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.attendanceFilterBox}>
              <Text style={styles.attendanceFilterLabel}>Attendance date</Text>
              <View style={styles.attendanceFilterRow}>
                <TouchableOpacity
                  style={styles.attendanceFilterButton}
                  onPress={() => setAttendanceDateFromDate(new Date())}
                  activeOpacity={0.85}
                >
                  <Text style={styles.attendanceFilterButtonText}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attendanceFilterButtonSecondary}
                  onPress={() => setShowAttendanceDatePicker(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.attendanceFilterButtonSecondaryText}>Pick Date 📅</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attendanceFilterButtonSecondary}
                  onPress={() => {
                    setSelectedAttendanceDate('');
                    setSelectedAttendanceWeekDay(null);
                    setSelectedAttendanceClassForDay(null);
                    setAttendanceSearch('');
                    setShowAttendanceDatePicker(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.attendanceFilterButtonSecondaryText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {selectedAttendanceDate ? (
                <Text style={styles.attendanceSelectedDateText}>{formatAttendanceDate(selectedAttendanceDate)}</Text>
              ) : (
                <Text style={styles.attendanceSelectedDateText}>No date selected</Text>
              )}

              {showAttendanceDatePicker && Platform.OS === 'web' &&
                React.createElement('input', {
                  type: 'date',
                  value: selectedAttendanceDate,
                  onChange: (event: any) => {
                    const value = event?.target?.value;
                    if (value) {
                      setAttendanceDateFromDate(safeDate(value));
                      setShowAttendanceDatePicker(false);
                    }
                  },
                  style: {
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 15,
                    maxWidth: 220,
                  },
                })
              }

              {showAttendanceDatePicker && Platform.OS !== 'web' && (
                <View style={styles.nativePickerBox}>
                  <DateTimePicker
                    value={attendancePickerDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: any, selectedDate?: Date) => {
                      if (Platform.OS === 'android') {
                        setShowAttendanceDatePicker(false);
                      }

                      if (event?.type === 'dismissed') return;

                      if (selectedDate) {
                        setAttendanceDateFromDate(selectedDate);
                      }
                    }}
                  />

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.attendanceFilterButton}
                      onPress={() => setShowAttendanceDatePicker(false)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.attendanceFilterButtonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <TextInput
              placeholder="Search student or parent..."
              style={styles.input}
              value={attendanceSearch}
              onChangeText={setAttendanceSearch}
            />

            {bookingsLoading ? (
              <Text style={styles.emptyStateText}>Loading attendance...</Text>
            ) : !selectedAttendanceDate || !selectedAttendanceWeekDay ? (
              <Text style={styles.emptyStateText}>Select a date to see that day’s classes.</Text>
            ) : selectedAttendanceWeekDay && !selectedAttendanceClassForDay ? (
              <View>
                <Text style={styles.attendanceStepTitle}>{selectedAttendanceWeekDay} Classes</Text>
                <Text style={styles.attendanceStepSubtitle}>{formatAttendanceDate(selectedAttendanceDate)}</Text>

                <View style={styles.attendanceClassGrid}>
                  {getClassesForDay(selectedAttendanceWeekDay)
                    .sort((a: any, b: any) => String(a.time).localeCompare(String(b.time)))
                    .map((cls: any) => {
                      const classBookings = getBookingsForClassOnDate(cls, selectedAttendanceDate);
                      const makeupCount = attendanceRecords.filter((record: any) =>
                        record.attendance_type === 'makeup' &&
                        record.status !== 'deleted' &&
                        record.attended_date === selectedAttendanceDate &&
                        String(record.attended_class_id) === String(cls.id)
                      ).length;
                      const present = classBookings.filter((b: any) => b.attended === true).length + makeupCount;
                      const absent = classBookings.filter((b: any) => b.attended === false).length;

                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.attendanceClassCard}
                          onPress={() => setSelectedAttendanceClassForDay(cls)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.attendanceClassName}>{cls.name} - {cls.age_group || cls.ageGroup || ''}</Text>
                          <Text style={styles.attendanceClassTime}>{cls.time || 'No time'}{cls.duration ? ` • ${cls.duration}` : ''}</Text>
                          <Text style={styles.attendanceClassCount}>{classBookings.length + makeupCount} students</Text>
                          <Text style={styles.attendanceClassStats}>{present} present • {absent} absent</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>

                {getClassesForDay(selectedAttendanceWeekDay).length === 0 && (
                  <Text style={styles.emptyStateText}>No classes available on {selectedAttendanceWeekDay}.</Text>
                )}
              </View>
            ) : selectedAttendanceClassForDay ? (
              <View>
                <TouchableOpacity
                  style={styles.backToClassesButton}
                  onPress={() => setSelectedAttendanceClassForDay(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToClassesText}>← Back to classes</Text>
                </TouchableOpacity>

                <View style={styles.attendanceSelectedHeader}>
                  <View>
                    <Text style={styles.attendanceStepTitle}>{formatAttendanceDate(selectedAttendanceDate)}</Text>
                    <Text style={styles.attendanceClassName}>{selectedAttendanceClassForDay.name} - {selectedAttendanceClassForDay.age_group || selectedAttendanceClassForDay.ageGroup || ''}</Text>
                    <Text style={styles.attendanceClassTime}>{selectedAttendanceClassForDay.time || 'No time'}{selectedAttendanceClassForDay.duration ? ` • ${selectedAttendanceClassForDay.duration}` : ''}</Text>
                  </View>
                </View>

                {getBookingsForClassOnDate(selectedAttendanceClassForDay, selectedAttendanceDate)
                  .filter((booking: any) => {
                    const parent = getParentForBooking(booking);
                    const child = getChildForBooking(booking);
                    const search = attendanceSearch.trim().toLowerCase();
                    if (!search) return true;
                    return (
                      String(parent?.name || '').toLowerCase().includes(search) ||
                      String(parent?.phoneNumber || '').toLowerCase().includes(search) ||
                      String(child?.name || '').toLowerCase().includes(search)
                    );
                  })
                  .map((booking: any) => {
                    const parent = getParentForBooking(booking);
                    const child = getChildForBooking(booking);
                    const statusText = booking.attended === true ? 'Present' : booking.attended === false ? 'Absent' : 'Not marked';

                    return (
                      <View key={booking.id} style={styles.attendanceStudentCard}>
                        <View style={styles.attendanceStudentInfo}>
                          <Text style={styles.attendanceName}>{child?.name || 'Unknown student'}</Text>
                          <Text style={styles.attendanceParent}>Parent: {parent?.name || 'Unknown parent'}</Text>
                          {!!parent?.phoneNumber && <Text style={styles.attendanceStatus}>Phone: {parent.phoneNumber}</Text>}
                          <Text style={styles.attendanceStatus}>Status: {statusText}</Text>
                        </View>

                        <View style={styles.attendanceActions}>
                          <TouchableOpacity
                            style={[styles.attendancePresentButton, booking.attended === true && styles.attendanceButtonActive]}
                            onPress={() => handleMarkAttendance(booking.id, true)}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.attendanceButtonText, booking.attended === true && styles.attendanceButtonTextActive]}>Present</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.attendanceAbsentButton, booking.attended === false && styles.attendanceAbsentButtonActive]}
                            onPress={() => handleMarkAttendance(booking.id, false)}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.attendanceAbsentText, booking.attended === false && styles.attendanceButtonTextActive]}>Absent</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                {getBookingsForClassOnDate(selectedAttendanceClassForDay, selectedAttendanceDate).length === 0 && (
                  <Text style={styles.emptyStateText}>No active/enrolled kids in this class for this date.</Text>
                )}
              </View>
            ) : null}
          </View>
        )}
        </ScrollView>
      </View>

      {showAnnouncementModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAnnouncement ? 'Edit' : 'Add'} Announcement</Text>
              <TouchableOpacity onPress={() => setShowAnnouncementModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={announcementForm.title} onChangeText={(text) => setAnnouncementForm({ ...announcementForm, title: text })} />
              <Text style={styles.label}>Message</Text>
              <TextInput style={[styles.input, styles.textArea]} value={announcementForm.message} onChangeText={(text) => setAnnouncementForm({ ...announcementForm, message: text })} multiline numberOfLines={4} />
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                {(['info', 'event', 'promotion'] as const).map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeButton, announcementForm.type === type && styles.typeButtonActive]} onPress={() => setAnnouncementForm({ ...announcementForm, type })}>
                    <Text style={[styles.typeButtonText, announcementForm.type === type && styles.typeButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Date</Text>
              <TextInput style={styles.input} value={announcementForm.date} onChangeText={(text) => setAnnouncementForm({ ...announcementForm, date: text })} placeholder="YYYY-MM-DD" />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowAnnouncementModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveAnnouncement}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showGalleryModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingGalleryItem ? 'Edit' : 'Add'} Gallery Item</Text>
              <TouchableOpacity onPress={() => setShowGalleryModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} value={galleryForm.url} onChangeText={(text) => setGalleryForm({ ...galleryForm, url: text })} />
              <Text style={styles.label}>Caption</Text>
              <TextInput style={styles.input} value={galleryForm.caption} onChangeText={(text) => setGalleryForm({ ...galleryForm, caption: text })} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowGalleryModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveGallery}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showCoachModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCoach ? 'Edit' : 'Add'} Coach</Text>
              <TouchableOpacity onPress={() => setShowCoachModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={coachForm.name} onChangeText={(text) => setCoachForm({ ...coachForm, name: text })} />
              <Text style={styles.label}>Specialization</Text>
              <TextInput style={styles.input} value={coachForm.specialization} onChangeText={(text) => setCoachForm({ ...coachForm, specialization: text })} />
              <Text style={styles.label}>Experience</Text>
              <TextInput style={styles.input} value={coachForm.experience} onChangeText={(text) => setCoachForm({ ...coachForm, experience: text })} />
              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.input, styles.textArea]} value={coachForm.bio} onChangeText={(text) => setCoachForm({ ...coachForm, bio: text })} multiline numberOfLines={4} />
              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} value={coachForm.imageUrl} onChangeText={(text) => setCoachForm({ ...coachForm, imageUrl: text })} />
              <Text style={styles.label}>Rating</Text>
              <TextInput style={styles.input} value={String(coachForm.rating)} onChangeText={(text) => setCoachForm({ ...coachForm, rating: parseFloat(text) || 5.0 })} keyboardType="numeric" />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowCoachModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveCoach}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showClassModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingClass ? 'Edit' : 'Add'} Class</Text>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={classForm.name} onChangeText={(text) => setClassForm({ ...classForm, name: text })} />
              <Text style={styles.label}>Age Group</Text>
              <TextInput style={styles.input} value={classForm.ageGroup} onChangeText={(text) => setClassForm({ ...classForm, ageGroup: text })} placeholder="e.g., 3-5 years" />
              <Text style={styles.label}>Level</Text>
              <View style={styles.typeButtons}>
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <TouchableOpacity key={level} style={[styles.typeButton, classForm.level === level && styles.typeButtonActive]} onPress={() => setClassForm({ ...classForm, level })}>
                    <Text style={[styles.typeButtonText, classForm.level === level && styles.typeButtonTextActive]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Day</Text>
              <View style={styles.typeButtons}>
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.typeButton, classForm.day === day && styles.typeButtonActive]}
                    onPress={() =>
                      setClassForm({
                        ...classForm,
                        day,
                        dayOfWeek: getDayOfWeekNumber(day),
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.typeButtonText, classForm.day === day && styles.typeButtonTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Time</Text>
              <TextInput style={styles.input} value={classForm.time} onChangeText={(text) => setClassForm({ ...classForm, time: text })} placeholder="e.g., 4:30 PM" />
              <Text style={styles.label}>Duration</Text>
              <TextInput style={styles.input} value={classForm.duration} onChangeText={(text) => setClassForm({ ...classForm, duration: text })} placeholder="e.g., 60 min" />
              <Text style={styles.label}>Coach ID</Text>
              <TextInput style={styles.input} value={classForm.coachId} onChangeText={(text) => setClassForm({ ...classForm, coachId: text })} />
              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={String(classForm.capacity)} onChangeText={(text) => setClassForm({ ...classForm, capacity: parseInt(text) || 30 })} keyboardType="numeric" />
              <Text style={styles.label}>Enrolled</Text>
              <TextInput style={styles.input} value={String(classForm.enrolled)} onChangeText={(text) => setClassForm({ ...classForm, enrolled: parseInt(text) || 0 })} keyboardType="numeric" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={classForm.description} onChangeText={(text) => setClassForm({ ...classForm, description: text })} multiline numberOfLines={4} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowClassModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveClass}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showEventModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEvent ? 'Edit' : 'Add'} Event</Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={eventForm.title} onChangeText={(text) => setEventForm({ ...eventForm, title: text })} />
              <Text style={styles.label}>Date</Text>
              <TextInput style={styles.input} value={eventForm.date} onChangeText={(text) => setEventForm({ ...eventForm, date: text })} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>Time</Text>
              <TextInput style={styles.input} value={eventForm.time} onChangeText={(text) => setEventForm({ ...eventForm, time: text })} placeholder="e.g., 6:30 PM" />
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                {(['Competition', 'Workshop', 'Showcase', 'Camp'] as const).map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeButton, eventForm.type === type && styles.typeButtonActive]} onPress={() => setEventForm({ ...eventForm, type })}>
                    <Text style={[styles.typeButtonText, eventForm.type === type && styles.typeButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={eventForm.description} onChangeText={(text) => setEventForm({ ...eventForm, description: text })} multiline numberOfLines={4} />
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} value={eventForm.location} onChangeText={(text) => setEventForm({ ...eventForm, location: text })} />
              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} value={eventForm.imageUrl} onChangeText={(text) => setEventForm({ ...eventForm, imageUrl: text })} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowEventModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveEvent}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showMakeupModal && selectedAttendanceClass && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Make-Up Student</Text>
              <TouchableOpacity onPress={() => setShowMakeupModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Class</Text>
              <Text style={styles.makeupContextText}>
                {selectedAttendanceClass.className} • {formatAttendanceDate(selectedAttendanceDate)}
              </Text>

              <Text style={styles.label}>Search Student or Parent</Text>
              <TextInput
                style={styles.input}
                value={makeupSearch}
                onChangeText={setMakeupSearch}
                placeholder="Type child or parent name"
              />

              <View style={styles.makeupResultsBox}>
                {makeupChildOptions.slice(0, 8).map((child: any) => {
                  const isSelected = selectedMakeupChild?.id === child.id;

                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={[styles.makeupResultCard, isSelected && styles.makeupResultCardActive]}
                      onPress={() => setSelectedMakeupChild(child)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.makeupResultName, isSelected && styles.makeupResultNameActive]}>
                        {child.name}
                      </Text>
                      <Text style={[styles.makeupResultParent, isSelected && styles.makeupResultParentActive]}>
                        Parent: {child.parentName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={makeupNote}
                onChangeText={setMakeupNote}
                placeholder="Example: Make-up for missed Monday class"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setShowMakeupModal(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, !selectedMakeupChild && styles.buttonDisabled]}
                  onPress={handleAddMakeupStudent}
                  disabled={!selectedMakeupChild}
                >
                  <Text style={styles.buttonPrimaryText}>Add Present</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {editingBooking && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Booking</Text>
              <TouchableOpacity onPress={() => setEditingBooking(null)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Booking Date</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.booking_date}
                onChangeText={(text) => setBookingForm({ ...bookingForm, booking_date: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Class ID</Text>
              <TextInput
                style={styles.input}
                value={bookingForm.class_id}
                onChangeText={(text) => setBookingForm({ ...bookingForm, class_id: text })}
                placeholder="Class UUID"
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.typeButtons}>
                {(['confirmed', 'cancelled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.typeButton, bookingForm.status === status && styles.typeButtonActive]}
                    onPress={() => setBookingForm({ ...bookingForm, status })}
                  >
                    <Text style={[styles.typeButtonText, bookingForm.status === status && styles.typeButtonTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setEditingBooking(null)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveBooking}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {editingUser && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setEditingUser(null)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={editForm.name} onChangeText={(text) => setEditForm({ ...editForm, name: text })} />
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={editForm.phoneNumber} onChangeText={(text) => setEditForm({ ...editForm, phoneNumber: text })} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setEditingUser(null)}>
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSaveUser}>
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerLogoutButton: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerLogoutText: { color: Colors.white, fontSize: 14, fontWeight: '700' as const },
  smallActionButton: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  smallActionButtonText: { color: Colors.white, fontSize: 14, fontWeight: '700' as const },
  container: {
    flex: 1,
    flexDirection: 'row' as const,
  },
  sidebar: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  sidebarScroll: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  logoutTab: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutTabText: {
    color: Colors.danger,
    fontWeight: '700' as const,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.darkGray,
  },
  tabTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  cardActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  announcementMessage: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
  },
  typePromotion: {
    backgroundColor: '#FFF3E0',
  },
  typeEvent: {
    backgroundColor: '#E8F5E9',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.darkGray,
    textTransform: 'capitalize' as const,
  },
  galleryInfo: {
    flex: 1,
  },
  galleryUrl: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 2,
  },
  galleryCaption: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  coachDetail: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 1,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  classDetail: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 1,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  eventDetail: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingClass: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  bookingUser: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  classSelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.darkGray,
    marginBottom: 8,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  classChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.darkGray,
  },
  classChipTextActive: {
    color: Colors.white,
  },
  dateSelector: {
    marginBottom: 16,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.darkGray,
  },
  dateChipTextActive: {
    color: Colors.white,
  },
  attendanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  attendanceCardPresent: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.success,
  },
  attendanceInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  attendanceName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
  },
  modal: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.darkGray,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  typeButtons: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.darkGray,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  buttonSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonSecondaryText: {
    color: Colors.darkGray,
    fontSize: 16,
    fontWeight: '600' as const,
  },

  bookingGroupCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingGroupHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  bookingScheduleLine: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  scheduleBox: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 12,
  },
  scheduleDateBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  scheduleDay: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  scheduleDate: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 2,
  },
  scheduleDateBoxCancelled: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  cancelledText: {
    color: '#991B1B',
  },
  bookingStatusText: {
    fontSize: 11,
    color: Colors.mediumGray,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  bookingDateActions: {
    flexDirection: 'row' as const,
    gap: 6,
    marginTop: 10,
  },
  bookingEditButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bookingEditButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800' as const,
  },
  bookingCancelButton: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bookingCancelButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800' as const,
  },

  attendanceSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  attendanceFilterBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attendanceFilterLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  attendanceFilterRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    alignItems: 'center' as const,
  },
  attendanceDateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 180,
    fontSize: 15,
    color: Colors.darkGray,
    backgroundColor: Colors.white,
  },
  attendanceFilterButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  attendanceFilterButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  attendanceFilterButtonSecondary: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  attendanceFilterButtonSecondaryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  attendanceStepTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  attendanceStepSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 12,
  },
  attendanceDayGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  attendanceDayCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceDayTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  attendanceDayDate: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  attendanceDayCount: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  attendanceClassGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginTop: 12,
  },
  attendanceClassCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    minWidth: 260,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceClassName: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  attendanceClassTime: {
    fontSize: 13,
    color: Colors.darkGray,
    marginBottom: 6,
  },
  attendanceClassCount: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  attendanceClassStats: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  backToClassesButton: {
    alignSelf: 'flex-start' as const,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  backToClassesText: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  attendanceSelectedHeader: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attendanceStudentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  attendanceStudentInfo: {
    flex: 1,
  },
  attendanceParent: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  attendanceStatus: {
    fontSize: 13,
    color: Colors.darkGray,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  attendanceActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  attendancePresentButton: {
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  attendanceButtonActive: {
    backgroundColor: '#10B981',
  },
  attendanceAbsentButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  attendanceAbsentButtonActive: {
    backgroundColor: '#EF4444',
  },
  attendanceButtonText: {
    color: '#065F46',
    fontWeight: '800' as const,
  },
  attendanceAbsentText: {
    color: '#991B1B',
    fontWeight: '800' as const,
  },
  attendanceButtonTextActive: {
    color: Colors.white,
  },
  makeupAddButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  makeupAddButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800' as const,
  },
  makeupStudentCard: {
    borderWidth: 2,
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  makeupNoteText: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 2,
  },
  makeupContextText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  makeupResultsBox: {
    marginBottom: 16,
    gap: 8,
  },
  makeupResultCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.white,
  },
  makeupResultCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E3F2FD',
  },
  makeupResultName: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  makeupResultNameActive: {
    color: Colors.primary,
  },
  makeupResultParent: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  makeupResultParentActive: {
    color: Colors.darkGray,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  attendanceSelectedDateText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: '700' as const,
    marginTop: 12,
  },
  nativePickerBox: {
    marginTop: 12,
    alignItems: 'flex-start' as const,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    paddingVertical: 32,
  },
});
