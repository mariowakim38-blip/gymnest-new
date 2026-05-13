import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Image,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import {
  Users,
  Calendar,
  Trash2,
  Edit2,
  X,
  ClipboardCheck,
  Check,
  Search,
  Megaphone,
  Image as ImageIcon,
  UserCheck,
  Plus,
  Book,
  CalendarDays,
  LogOut,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth, User } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { classes, Class } from "@/constants/mockData";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

type TabType =
  | "users"
  | "bookings"
  | "attendance"
  | "announcements"
  | "gallery"
  | "coaches"
  | "classes"
  | "events";

export default function AdminPanel() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("announcements");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClassDate, setSelectedClassDate] = useState<string>("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    childId: "",
    childName: "",
    childAge: "",
  });
  const [userSearch, setUserSearch] = useState<string>("");
  const [showCreateUserModal, setShowCreateUserModal] =
    useState<boolean>(false);
  const [createUserLoading, setCreateUserLoading] = useState<boolean>(false);
  const [createUserForm, setCreateUserForm] = useState({
    parentFirstName: "",
    parentLastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    childFirstName: "",
    childAge: "",
  });
  const [searchDate, setSearchDate] = useState<string>("");
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>("");
  const [selectedAttendanceDate, setSelectedAttendanceDate] =
    useState<string>("");
  const [selectedAttendanceClassKey, setSelectedAttendanceClassKey] =
    useState<string>("");

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [showMakeupModal, setShowMakeupModal] = useState<boolean>(false);
  const [makeupSearch, setMakeupSearch] = useState<string>("");
  const [selectedMakeupChild, setSelectedMakeupChild] = useState<any>(null);
  const [makeupNote, setMakeupNote] = useState<string>("");

  const [showAnnouncementModal, setShowAnnouncementModal] =
    useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "event" | "promotion",
    date: new Date().toISOString().split("T")[0],
  });

  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<any>(null);
  const [galleryForm, setGalleryForm] = useState({ url: "", caption: "" });
  const [galleryUploading, setGalleryUploading] = useState<boolean>(false);

  const [showCoachModal, setShowCoachModal] = useState<boolean>(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [coachForm, setCoachForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    bio: "",
    imageUrl: "",
    rating: 5.0,
  });

  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({
    name: "Gymnastics Class",
    ageGroup: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    day: "",
    time: "",
    duration: "60 min",
    coachId: "",
    capacity: 30,
    enrolled: 0,
    description: "",
    dayOfWeek: 1,
  });

  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    type: "Competition" as "Competition" | "Workshop" | "Showcase" | "Camp",
    description: "",
    location: "",
    imageUrl: "",
  });

  const [selectedBookingDay, setSelectedBookingDay] = useState<string | null>(
    null,
  );
  const [selectedBookingClass, setSelectedBookingClass] = useState<any | null>(
    null,
  );
  const [bookingSearch, setBookingSearch] = useState<string>("");

  const [selectedAttendanceWeekDay, setSelectedAttendanceWeekDay] = useState<
    string | null
  >(null);
  const [selectedAttendanceClassForDay, setSelectedAttendanceClassForDay] =
    useState<any | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState<string>("");
  const [showAttendanceDatePicker, setShowAttendanceDatePicker] =
    useState<boolean>(false);
  const [attendancePickerDate, setAttendancePickerDate] = useState<Date>(
    new Date(),
  );
  const [attendanceType, setAttendanceType] = useState<"class" | "private">(
    "class",
  );
  const [privateAttendanceSessions, setPrivateAttendanceSessions] = useState<
    any[]
  >([]);

  const [selectedClassesDay, setSelectedClassesDay] = useState<string | null>(
    null,
  );
  const [adminClasses, setAdminClasses] = useState<any[]>([]);
  const [adminClassesLoading, setAdminClassesLoading] =
    useState<boolean>(false);
  const [adminClassesError, setAdminClassesError] = useState<any>(null);
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("Log out of the admin panel?")) await logout();
      return;
    }
    Alert.alert("Logout", "Log out of the admin panel?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
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
    booking_date: "",
    class_id: "",
    status: "confirmed" as "confirmed" | "cancelled",
  });
  const [bookingDateDrafts, setBookingDateDrafts] = useState<
    Record<string, string>
  >({});
  const [bookingClassDrafts, setBookingClassDrafts] = useState<
    Record<string, string>
  >({});

  const refreshUsers = async () => {
    if (!isAdmin) return;

    setUsersLoading(true);
    setUsersError(null);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Admin users fetch error:", profilesError);
      setUsersError(profilesError);
      setAllUsers([]);
      setUsersLoading(false);
      return;
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from("children")
      .select("*");

    if (childrenError) {
      console.error("Admin children fetch error:", childrenError);
    }

    const mappedUsers = (profiles ?? []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      name: profile.name ?? "Unnamed user",
      username: profile.username ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phone_number ?? "",
      role: profile.role ?? "parent",
      children: (childrenData ?? [])
        .filter((child: any) => child.profile_id === profile.id)
        .map((child: any) => ({
          id: child.id,
          name: child.name ?? "Unnamed child",
          age: child.age ?? "",
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
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Admin bookings fetch error:", bookingsError);
      setBookingsError(bookingsError);
      setBookings([]);
      setBookingsLoading(false);
      return;
    }

    const { data: classesData, error: classesError } = await supabase
      .from("classes")
      .select("id, name, age_group, day, time, duration");

    if (classesError) {
      console.error("Admin classes fetch error:", classesError);
    }

    const mappedBookings = (bookingsData ?? []).map((booking: any) => {
      const cls = (classesData ?? []).find(
        (c: any) => String(c.id) === String(booking.class_id),
      );

      return {
        id: booking.id,
        profileId: booking.profile_id,
        childId: booking.child_id,
        classId: booking.class_id,
        className: cls
          ? `${cls.name} - ${cls.age_group ?? ""}`
          : `Unknown Class (${booking.class_id})`,
        classDay: cls?.day ?? "",
        classTime: cls?.time ?? "",
        classDuration: cls?.duration ?? "",
        studentId: `${booking.profile_id}::${booking.child_id}`,
        bookingDate: booking.booking_date,
        classDate: booking.booking_date,
        status: booking.status ?? "confirmed",
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
      .from("attendance_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin attendance records fetch error:", error);
      setAttendanceRecords([]);
      return;
    }

    setAttendanceRecords(data ?? []);
  };

  const refreshPrivateAttendanceSessions = async () => {
    if (!isAdmin) return;

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("private_booking_sessions")
      .select("*")
      .order("session_date", { ascending: true });

    if (sessionsError) {
      console.error("Private attendance sessions fetch error:", sessionsError);
      setPrivateAttendanceSessions([]);
      return;
    }

    const { data: privateBookingsData, error: privateBookingsError } =
      await supabase.from("private_bookings").select("*");

    if (privateBookingsError) {
      console.error("Private bookings fetch error:", privateBookingsError);
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone_number");

    if (profilesError) {
      console.error("Private attendance profiles fetch error:", profilesError);
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from("children")
      .select("id, profile_id, name, age");

    if (childrenError) {
      console.error("Private attendance children fetch error:", childrenError);
    }

    const mappedPrivateSessions = (sessionsData ?? []).map((session: any) => {
      const privateBooking = (privateBookingsData ?? []).find(
        (booking: any) =>
          String(booking.id) === String(session.private_booking_id),
      );
      const parent = (profilesData ?? []).find(
        (profile: any) =>
          String(profile.id) === String(privateBooking?.profile_id),
      );
      const child = (childrenData ?? []).find(
        (item: any) => String(item.id) === String(privateBooking?.child_id),
      );

      return {
        ...session,
        privateBooking,
        parent,
        child,
      };
    });

    setPrivateAttendanceSessions(mappedPrivateSessions);
  };

  const refreshAdminClasses = async () => {
    if (!isAdmin) return;

    setAdminClassesLoading(true);
    setAdminClassesError(null);

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Admin classes fetch error:", error);
      setAdminClassesError(error);
      setAdminClasses([]);
      setAdminClassesLoading(false);
      return;
    }

    setAdminClasses(data ?? []);
    setAdminClassesLoading(false);
  };

  const refreshAdminPageData = async () => {
    await Promise.all([
      refreshUsers(),
      refreshBookings(),
      refreshAttendanceRecords(),
      refreshPrivateAttendanceSessions(),
      refreshAdminClasses(),
    ]);
  };

  useEffect(() => {
    if (isAdmin) {
      refreshUsers();
      refreshBookings();
      refreshAnnouncements();
      refreshEvents();
      refreshAttendanceRecords();
      refreshPrivateAttendanceSessions();
      refreshAdminClasses();
    }
  }, [isAdmin]);
  const {
    data: privateSessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refreshSessions,
  } = trpc.sessions.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] =
    useState<boolean>(false);
  const [announcementsError, setAnnouncementsError] = useState<any>(null);

  const refreshAnnouncements = async () => {
    if (!isAdmin) return;

    setAnnouncementsLoading(true);
    setAnnouncementsError(null);

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Admin announcements fetch error:", error);
      setAnnouncementsError(error);
      setAnnouncements([]);
      setAnnouncementsLoading(false);
      return;
    }

    setAnnouncements(data ?? []);
    setAnnouncementsLoading(false);
  };
  const {
    data: galleryItems = [],
    isLoading: galleryLoading,
    error: galleryError,
    refetch: refreshGallery,
  } = trpc.gallery.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const {
    data: dbCoaches = [],
    isLoading: coachesLoading,
    error: coachesError,
    refetch: refreshCoaches,
  } = trpc.coaches.getAll.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const {
    data: dbClasses = [],
    isLoading: classesLoading,
    error: classesError,
    refetch: refreshClasses,
  } = trpc.classes.getAll.useQuery(undefined, {
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
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Admin events fetch error:", error);
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
      console.error("=== tRPC Users Error ===");
      console.error("Error object:", usersError);
      console.error("Error message:", usersError.message);
      console.error("Error data:", usersError.data);
      console.error("Error shape:", usersError.shape);
      try {
        console.error("Error JSON:", JSON.stringify(usersError, null, 2));
      } catch {
        console.error("Could not stringify error");
      }
    }
  }, [usersError]);

  useEffect(() => {
    if (bookingsError) {
      console.error("=== tRPC Bookings Error ===");
      console.error("Error:", bookingsError.message);
    }
  }, [bookingsError]);

  useEffect(() => {
    if (announcementsError) {
      console.error("=== tRPC Announcements Error ===");
      console.error("Error:", announcementsError.message);
    }
  }, [announcementsError]);

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => refreshUsers(),
  });
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => refreshUsers(),
  });
  const cancelBookingMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => refreshBookings(),
  });
  const markAttendanceMutation = trpc.bookings.markAttendance.useMutation({
    onSuccess: () => refreshBookings(),
  });

  const createGalleryMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      refreshGallery();
      setShowGalleryModal(false);
    },
  });
  const updateGalleryMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      refreshGallery();
      setShowGalleryModal(false);
    },
  });
  const deleteGalleryMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => refreshGallery(),
  });

  const createCoachMutation = trpc.coaches.create.useMutation({
    onSuccess: () => {
      refreshCoaches();
      setShowCoachModal(false);
    },
  });
  const updateCoachMutation = trpc.coaches.update.useMutation({
    onSuccess: () => {
      refreshCoaches();
      setShowCoachModal(false);
    },
  });
  const deleteCoachMutation = trpc.coaches.delete.useMutation({
    onSuccess: () => refreshCoaches(),
  });

  const createClassMutation = trpc.classes.create.useMutation({
    onSuccess: () => {
      refreshClasses();
      setShowClassModal(false);
    },
  });
  const updateClassMutation = trpc.classes.update.useMutation({
    onSuccess: () => {
      refreshClasses();
      setShowClassModal(false);
    },
  });
  const deleteClassMutation = trpc.classes.delete.useMutation({
    onSuccess: () => refreshClasses(),
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      Alert.alert("Access Denied", `You do not have admin privileges.`);
      router.replace("/(tabs)/(home)" as any);
    }
  }, [user, router]);

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      const msg = "Missing user auth ID.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    const deleteUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const msg = "You are not logged in.";
          if (Platform.OS === "web") alert(msg);
          else Alert.alert("Error", msg);
          return;
        }

        const response = await fetch(
          "https://hnkncuqckibrowronjyq.supabase.co/functions/v1/clever-responder",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ userId }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          const msg = result.error || "Failed to delete user.";
          if (Platform.OS === "web") alert(msg);
          else Alert.alert("Delete failed", msg);
          return;
        }

        await refreshUsers();
        await refreshBookings();

        const msg = "User deleted permanently.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Success", msg);
      } catch (error: any) {
        const msg = error?.message || "Something went wrong.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm("Permanently delete this user? This cannot be undone.")
      ) {
        await deleteUser();
      }
    } else {
      Alert.alert(
        "Delete User",
        "Permanently delete this user? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: deleteUser },
        ],
      );
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!userId) {
      const msg = "Missing auth user ID.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    let newPassword = "";

    if (Platform.OS === "web") {
      const result = window.prompt(
        "Enter new temporary password (minimum 6 characters)",
      );
      if (!result) return;
      newPassword = result.trim();
    } else {
      const msg =
        "Password reset from mobile admin is not supported yet. Please use the web admin panel.";
      Alert.alert("Use Web Admin", msg);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      const msg = "Password must be at least 6 characters.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const msg = "Not authenticated.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }

      const response = await fetch(
        "https://hnkncuqckibrowronjyq.supabase.co/functions/v1/admin-reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId,
            newPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const msg = result.error || "Failed to reset password.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }

      const msg = "Password reset successfully.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Success", msg);
    } catch (error: any) {
      const msg = error?.message || "Something went wrong.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    }
  };

  const handleEditUser = (u: any, child?: any) => {
    const selectedChild = child || u.children?.[0];

    setEditingUser(u);
    setEditForm({
      name: u.name || "",
      username: u.username || "",
      phoneNumber: u.phoneNumber || "",
      childId: selectedChild?.id || "",
      childName: selectedChild?.name || "",
      childAge: selectedChild?.age ? String(selectedChild.age) : "",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const cleanName = editForm.name.trim();
    const cleanUsername = editForm.username.trim();
    const cleanPhone = editForm.phoneNumber.trim();
    const cleanChildName = editForm.childName.trim();
    const cleanChildAge = Number(editForm.childAge);

    if (!cleanName || !cleanUsername || !cleanPhone) {
      const msg = "Parent name, username, and phone are required.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing information", msg);
      return;
    }

    if (
      editForm.childId &&
      (!cleanChildName ||
        !Number.isFinite(cleanChildAge) ||
        cleanChildAge < 1 ||
        cleanChildAge > 18)
    ) {
      const msg =
        "Child name and valid child age between 1 and 18 are required.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing child information", msg);
      return;
    }

    const profilePatch = {
      name: cleanName,
      username: cleanUsername,
      phone_number: cleanPhone,
    };

    let profileUpdate = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("user_id", editingUser.userId)
      .select("id, user_id, name, username, phone_number")
      .maybeSingle();

    if ((!profileUpdate.data || profileUpdate.error) && editingUser.id) {
      profileUpdate = await supabase
        .from("profiles")
        .update(profilePatch)
        .eq("id", editingUser.id)
        .select("id, user_id, name, username, phone_number")
        .maybeSingle();
    }

    if (profileUpdate.error || !profileUpdate.data) {
      const msg =
        profileUpdate.error?.message ||
        "Parent was not updated. Profile row was not found.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    if (editForm.childId) {
      const childUpdate = await supabase
        .from("children")
        .update({
          name: cleanChildName,
          age: cleanChildAge,
        })
        .eq("id", editForm.childId)
        .select("id, name, age")
        .maybeSingle();

      if (childUpdate.error || !childUpdate.data) {
        const msg =
          childUpdate.error?.message ||
          "Child was not updated. Child row was not found.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }
    }

    const updatedUser = {
      ...editingUser,
      id: profileUpdate.data.id || editingUser.id,
      userId: profileUpdate.data.user_id || editingUser.userId,
      name: profileUpdate.data.name ?? cleanName,
      username: profileUpdate.data.username ?? cleanUsername,
      phoneNumber: profileUpdate.data.phone_number ?? cleanPhone,
      children: (editingUser.children || []).map((child: any) =>
        String(child.id) === String(editForm.childId)
          ? {
              ...child,
              name: cleanChildName,
              age: cleanChildAge,
            }
          : child,
      ),
    };

    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === String(editingUser.id) ||
        String(u.userId) === String(editingUser.userId)
          ? updatedUser
          : u,
      ),
    );

    setEditingUser(null);

    await refreshUsers();
    await refreshBookings();

    const msg = "User updated successfully.";
    if (Platform.OS === "web") alert(msg);
    else Alert.alert("Success", msg);
  };

  const resetCreateUserForm = () => {
    setCreateUserForm({
      parentFirstName: "",
      parentLastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      childFirstName: "",
      childAge: "",
    });
  };

  const handleOpenCreateUserModal = () => {
    resetCreateUserForm();
    setShowCreateUserModal(true);
  };

  const handleCreateParentAccount = async () => {
    const parentFirstName = createUserForm.parentFirstName.trim();
    const parentLastName = createUserForm.parentLastName.trim();
    const username = createUserForm.username.trim();
    const email = createUserForm.email.trim().toLowerCase();
    const phoneNumber = createUserForm.phoneNumber.trim();
    const password = createUserForm.password;
    const childFirstName = createUserForm.childFirstName.trim();
    const childAge = Number(createUserForm.childAge);

    if (
      !parentFirstName ||
      !parentLastName ||
      !username ||
      !email ||
      !phoneNumber ||
      !password ||
      !childFirstName ||
      !createUserForm.childAge.trim()
    ) {
      const msg = "All fields are required.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    if (!Number.isFinite(childAge) || childAge < 1 || childAge > 18) {
      const msg = "Child age must be between 1 and 18.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    const parentName = `${parentFirstName} ${parentLastName}`.trim();
    const childName = `${childFirstName} ${parentLastName}`.trim();
    const cleanPhone = phoneNumber.startsWith("+961")
      ? phoneNumber
      : `+961${phoneNumber}`;

    setCreateUserLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const msg = "Not authenticated";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }

      const response = await fetch(
        "https://hnkncuqckibrowronjyq.supabase.co/functions/v1/admin-create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email,
            password,
            parentName,
            username,
            phoneNumber: cleanPhone,
            childName,
            childAge,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const msg = result.error || "Failed to create user";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Error", msg);
        return;
      }

      await refreshUsers();
      setShowCreateUserModal(false);
      resetCreateUserForm();

      const msg = "User created successfully";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Success", msg);
    } catch (error: any) {
      const msg = error?.message || "Something went wrong";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const cancelBooking = async () => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) {
        const errorMessage = error.message || "Failed to cancel booking";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      await refreshAdminPageData();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Cancel this booking?")) cancelBooking();
    } else {
      Alert.alert("Cancel Booking", "Are you sure?", [
        { text: "No", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: cancelBooking },
      ]);
    }
  };

  const handleEditBooking = (bookingOrGroup: any) => {
    const bookingItems = Array.isArray(bookingOrGroup?.bookings)
      ? bookingOrGroup.bookings
      : [bookingOrGroup];

    const validBookings = bookingItems.filter(Boolean);
    const firstBooking = validBookings[0];

    if (!firstBooking) return;

    setEditingBooking({
      ...firstBooking,
      editingBookings: validBookings,
    });

    setBookingDateDrafts(
      validBookings.reduce((acc: Record<string, string>, booking: any) => {
        acc[String(booking.id)] = getBookingDateKey(booking);
        return acc;
      }, {}),
    );

    setBookingClassDrafts(
      validBookings.reduce((acc: Record<string, string>, booking: any) => {
        acc[String(booking.id)] = String(booking.classId || booking.class_id || "");
        return acc;
      }, {}),
    );

    setBookingForm({
      booking_date: firstBooking.classDate || firstBooking.bookingDate || "",
      class_id: firstBooking.classId || "",
      status: firstBooking.status === "cancelled" ? "cancelled" : "confirmed",
    });
  };

  const updateEditingBookingItem = (bookingId: string, patch: any) => {
    setEditingBooking((current: any) => {
      if (!current) return current;

      const items = Array.isArray(current.editingBookings)
        ? current.editingBookings
        : [current];

      const updatedItems = items.map((booking: any) =>
        String(booking.id) === String(bookingId)
          ? {
              ...booking,
              ...patch,
              bookingDate:
                patch.booking_date ?? patch.bookingDate ?? booking.bookingDate,
              classDate:
                patch.booking_date ?? patch.classDate ?? booking.classDate,
              classId:
                patch.class_id ?? patch.classId ?? booking.classId,
            }
          : booking,
      );

      return {
        ...current,
        editingBookings: updatedItems,
      };
    });
  };

  const removeEditingBookingItem = (bookingId: string) => {
    setEditingBooking((current: any) => {
      if (!current) return current;

      const items = Array.isArray(current.editingBookings)
        ? current.editingBookings
        : [current];

      const remainingItems = items.filter(
        (booking: any) => String(booking.id) !== String(bookingId),
      );

      if (remainingItems.length === 0) return null;

      return {
        ...remainingItems[0],
        editingBookings: remainingItems,
      };
    });
  };

  const handleUpdateBookingDate = async (bookingId: string) => {
    const newDate = String(bookingDateDrafts[bookingId] || "").trim();
    const newClassId = String(bookingClassDrafts[bookingId] || "").trim();

    if (!newDate) {
      const msg = "Please choose a booking date.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing date", msg);
      return;
    }

    if (!newClassId) {
      const msg = "Please choose the make-up class.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing class", msg);
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_date: newDate,
        class_id: newClassId,
        attended: null,
        attendance_marked_at: null,
        status: "confirmed",
      })
      .eq("id", bookingId);

    if (error) {
      const errorMessage = error.message || "Failed to update make-up session.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
      return;
    }

    updateEditingBookingItem(bookingId, {
      booking_date: newDate,
      class_id: newClassId,
      attended: null,
      status: "confirmed",
    });

    await refreshAdminPageData();

    const msg = "Make-up session updated. The existing session was replaced with the selected date and class.";
    if (Platform.OS === "web") alert(msg);
    else Alert.alert("Success", msg);
  };

  const handleCancelBookingDate = async (bookingId: string) => {
    const confirmCancel =
      Platform.OS === "web"
        ? window.confirm("Cancel this single booking date?")
        : true;

    if (!confirmCancel) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      const errorMessage = error.message || "Failed to cancel booking date.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
      return;
    }

    removeEditingBookingItem(bookingId);
    await refreshAdminPageData();
  };

  const handleDeleteBookingDate = async (bookingId: string) => {
    const deleteDate = async () => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) {
        const errorMessage = error.message || "Failed to delete booking date.";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      removeEditingBookingItem(bookingId);
      await refreshAdminPageData();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this booking date permanently?"))
        await deleteDate();
    } else {
      Alert.alert("Delete Date", "Delete this booking date permanently?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteDate },
      ]);
    }
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;

    const items = Array.isArray(editingBooking.editingBookings)
      ? editingBooking.editingBookings
      : [editingBooking];

    await Promise.all(
      items.map((booking: any) => {
        const newDate = String(bookingDateDrafts[booking.id] || "").trim();
        if (!newDate) return Promise.resolve();

        const newClassId = String(bookingClassDrafts[booking.id] || booking.classId || "").trim();

        return supabase
          .from("bookings")
          .update({
            booking_date: newDate,
            class_id: newClassId || booking.classId,
            attended: null,
            attendance_marked_at: null,
            status: "confirmed",
          })
          .eq("id", booking.id);
      }),
    );

    await refreshAdminPageData();
    setEditingBooking(null);
  };

  const handleMarkAttendance = async (bookingId: string, attended: boolean) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        attended,
        attendance_marked_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Attendance update error:", error);
      Alert.alert("Attendance Error", error.message);
      return;
    }

    await refreshAdminPageData();
  };

  const handleMarkPrivateAttendance = async (
    sessionId: string,
    attended: boolean,
  ) => {
    const { error } = await supabase
      .from("private_booking_sessions")
      .update({
        attended,
        attendance_marked_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Private attendance update error:", error);
      const errorMessage =
        error.message || "Failed to update private attendance.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Private Attendance Error", errorMessage);
      return;
    }

    await refreshAdminPageData();
  };

  const makeupChildOptions = allUsers
    .flatMap((u: any) =>
      (u.children || []).map((child: any) => ({
        ...child,
        profile_id: u.id,
        parentName: u.name,
      })),
    )
    .filter((child: any) =>
      makeupSearch.trim()
        ? String(child.name || "")
            .toLowerCase()
            .includes(makeupSearch.toLowerCase()) ||
          String(child.parentName || "")
            .toLowerCase()
            .includes(makeupSearch.toLowerCase())
        : true,
    );

  const handleOpenMakeupModal = () => {
    setMakeupSearch("");
    setSelectedMakeupChild(null);
    setMakeupNote("");
    setShowMakeupModal(true);
  };

  const handleAddMakeupStudent = async () => {
    if (
      !selectedMakeupChild ||
      !selectedAttendanceClassForDay ||
      !selectedAttendanceDate
    ) {
      const msg = "Select a student before replacing a session.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("Missing student", msg);
      return;
    }

    const { data: candidateBookings, error: candidateError } = await supabase
      .from("bookings")
      .select("*")
      .eq("child_id", selectedMakeupChild.id)
      .neq("status", "cancelled")
      .order("booking_date", { ascending: true });

    if (candidateError) {
      const errorMessage = candidateError.message || "Failed to find an existing session to replace.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
      return;
    }

    const replacementBooking = (candidateBookings ?? []).find((booking: any) => {
      const sameDate = String(booking.booking_date) === String(selectedAttendanceDate);
      const sameClass = String(booking.class_id) === String(selectedAttendanceClassForDay.id);
      const alreadyMarkedPresent = booking.attended === true;
      return !(sameDate && sameClass) && !alreadyMarkedPresent;
    });

    if (!replacementBooking) {
      const msg = "No available existing session was found to replace. Make-up must replace one existing session, not create an extra one.";
      if (Platform.OS === "web") alert(msg);
      else Alert.alert("No session to replace", msg);
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        class_id: selectedAttendanceClassForDay.id,
        booking_date: selectedAttendanceDate,
        attended: true,
        attendance_marked_at: new Date().toISOString(),
        status: "confirmed",
      })
      .eq("id", replacementBooking.id);

    if (error) {
      const errorMessage = error.message || "Failed to replace session with make-up.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
      return;
    }

    await refreshAdminPageData();

    setShowMakeupModal(false);
    setSelectedMakeupChild(null);
    setMakeupSearch("");
    setMakeupNote("");

    const msg = "Make-up saved. One existing session was replaced and marked present.";
    if (Platform.OS === "web") alert(msg);
    else Alert.alert("Success", msg);
  };

  const handleDeleteMakeupRecord = async (recordId: string) => {
    const deleteRecord = async () => {
      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("id", recordId);

      if (error) {
        const errorMessage =
          error.message || "Failed to remove make-up student.";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      setAttendanceRecords((prev) =>
        prev.filter((record) => record.id !== recordId),
      );
    };

    if (Platform.OS === "web") {
      if (window.confirm("Remove this make-up student from attendance?"))
        deleteRecord();
    } else {
      Alert.alert(
        "Remove student",
        "Remove this make-up student from attendance?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: deleteRecord },
        ],
      );
    }
  };

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      message: "",
      type: "info",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAnnouncementModal(true);
  };

  const handleEditAnnouncement = (item: any) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      message: item.message,
      type: item.type,
      date: item.date,
    });
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async () => {
    try {
      const cleanTitle = announcementForm.title.trim();
      const cleanMessage = announcementForm.message.trim();
      const cleanDate = announcementForm.date.trim();

      if (!cleanTitle || !cleanMessage || !cleanDate) {
        const msg = "Title, message, and date are required.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Missing information", msg);
        return;
      }

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update({
            title: cleanTitle,
            message: cleanMessage,
            type: announcementForm.type,
            date: cleanDate,
          })
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert({
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
      console.log("Announcement saved directly to Supabase");
    } catch (error) {
      console.error("Failed to save announcement:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save announcement";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    const deleteAnnouncement = async () => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) {
        const errorMessage = error.message || "Failed to delete announcement";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      await refreshAnnouncements();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this announcement?")) deleteAnnouncement();
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteAnnouncement },
      ]);
    }
  };

  const handleAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ url: "", caption: "" });
    setShowGalleryModal(true);
  };

  const handleEditGallery = (item: any) => {
    setEditingGalleryItem(item);
    setGalleryForm({ url: item.url, caption: item.caption });
    setShowGalleryModal(true);
  };

  const handlePickGalleryImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const msg =
          "Please allow photo library access to upload gallery images.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Permission needed", msg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setGalleryUploading(true);

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fallbackExt = asset.mimeType?.split("/")[1] || "jpg";
      const fileExt = asset.fileName?.split(".").pop() || fallbackExt;
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, blob, {
          contentType: asset.mimeType || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("gallery").getPublicUrl(filePath);
      setGalleryForm((prev) => ({ ...prev, url: data.publicUrl }));
    } catch (error) {
      console.error("Gallery upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image.";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Upload Error", errorMessage);
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleSaveGallery = async () => {
    try {
      if (!galleryForm.url.trim()) {
        const msg = "Please upload an image before saving.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Missing image", msg);
        return;
      }

      if (editingGalleryItem) {
        await updateGalleryMutation.mutateAsync({
          id: editingGalleryItem.id,
          ...galleryForm,
        });
      } else {
        await createGalleryMutation.mutateAsync(galleryForm);
      }
      console.log("Gallery item saved successfully");
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save gallery item";
      if (Platform.OS === "web") {
        alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleDeleteGallery = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete this image?"))
        deleteGalleryMutation.mutate({ id });
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteGalleryMutation.mutate({ id }),
        },
      ]);
    }
  };

  const handleAddCoach = () => {
    setEditingCoach(null);
    setCoachForm({
      name: "",
      specialization: "",
      experience: "",
      bio: "",
      imageUrl: "",
      rating: 5.0,
    });
    setShowCoachModal(true);
  };

  const handleEditCoach = (item: any) => {
    setEditingCoach(item);
    const imageUrl = "image_url" in item ? item.image_url : item.imageUrl;
    setCoachForm({
      name: item.name,
      specialization: item.specialization,
      experience: item.experience,
      bio: item.bio,
      imageUrl,
      rating: item.rating,
    });
    setShowCoachModal(true);
  };

  const handleSaveCoach = async () => {
    try {
      if (editingCoach) {
        await updateCoachMutation.mutateAsync({
          id: editingCoach.id,
          ...coachForm,
        });
      } else {
        await createCoachMutation.mutateAsync(coachForm);
      }
      console.log("Coach saved successfully");
    } catch (error) {
      console.error("Failed to save coach:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save coach";
      if (Platform.OS === "web") {
        alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleDeleteCoach = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete this coach?"))
        deleteCoachMutation.mutate({ id });
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCoachMutation.mutate({ id }),
        },
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

    return (
      dayMap[
        String(day || "")
          .trim()
          .toLowerCase()
      ] ?? 1
    );
  };

  const handleAddClass = () => {
    const defaultDay = selectedClassesDay || "Monday";
    setEditingClass(null);
    setClassForm({
      name: "Gymnastics Class",
      ageGroup: "",
      level: "Beginner",
      day: defaultDay,
      time: "",
      duration: "60 min",
      coachId: "",
      capacity: 30,
      enrolled: 0,
      description: "",
      dayOfWeek: getDayOfWeekNumber(defaultDay),
    });
    setShowClassModal(true);
  };

  const handleEditClass = (item: any) => {
    setEditingClass(item);

    const ageGroup = "age_group" in item ? item.age_group : item.ageGroup;
    const coachId = "coach_id" in item ? item.coach_id : item.coachId;
    const rawDayOfWeek =
      "day_of_week" in item ? item.day_of_week : item.dayOfWeek;
    const dayOfWeek = Number.isFinite(Number(rawDayOfWeek))
      ? Number(rawDayOfWeek)
      : getDayOfWeekNumber(item.day);

    setClassForm({
      name: String(item.name ?? ""),
      ageGroup: String(ageGroup ?? ""),
      level: (item.level ?? "Beginner") as
        | "Beginner"
        | "Intermediate"
        | "Advanced",
      day: String(item.day ?? ""),
      time: String(item.time ?? ""),
      duration: String(item.duration ?? "60 min"),
      coachId: String(coachId ?? ""),
      capacity: Number(item.capacity) || 30,
      enrolled: Number(item.enrolled) || 0,
      description: String(item.description ?? ""),
      dayOfWeek,
    });
    setShowClassModal(true);
  };

  const handleSaveClass = async () => {
    try {
      const cleanName = String(classForm.name ?? "").trim();
      const cleanAgeGroup = String(classForm.ageGroup ?? "").trim();
      const cleanDay = String(classForm.day ?? "").trim();
      const cleanTime = String(classForm.time ?? "").trim();
      const cleanDuration = String(classForm.duration ?? "").trim();
      const cleanDescription = String(classForm.description ?? "").trim();
      const cleanCoachId = String(classForm.coachId ?? "").trim();

      if (
        !cleanName ||
        !cleanAgeGroup ||
        !cleanDay ||
        !cleanTime ||
        !cleanDuration
      ) {
        const msg = "Name, age group, day, time, and duration are required.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Missing information", msg);
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
          .from("classes")
          .update(payload)
          .eq("id", editingClass.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert(payload);

        if (error) throw error;
      }

      await refreshAdminClasses();
      await refreshBookings();
      setShowClassModal(false);
      setEditingClass(null);
      console.log("Class saved directly to Supabase");
    } catch (error) {
      console.error("Failed to save class:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save class";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
    }
  };

  const handleDeleteClass = (id: string) => {
    const deleteClass = async () => {
      const { error } = await supabase.from("classes").delete().eq("id", id);

      if (error) {
        const errorMessage = error.message || "Failed to delete class";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      await refreshAdminClasses();
      await refreshBookings();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this class?")) deleteClass();
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteClass },
      ]);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      date: "",
      time: "",
      type: "Competition",
      description: "",
      location: "",
      imageUrl: "",
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (item: any) => {
    setEditingEvent(item);
    const imageUrl = "image_url" in item ? item.image_url : item.imageUrl;
    setEventForm({
      title: item.title,
      date: item.date,
      time: item.time,
      type: item.type,
      description: item.description,
      location: item.location,
      imageUrl,
    });
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

      if (
        !cleanTitle ||
        !cleanDate ||
        !cleanTime ||
        !cleanDescription ||
        !cleanLocation
      ) {
        const msg =
          "Title, date, time, description, and location are required.";
        if (Platform.OS === "web") alert(msg);
        else Alert.alert("Missing information", msg);
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
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);

        if (error) throw error;
      }

      await refreshEvents();
      setShowEventModal(false);
      setEditingEvent(null);
      console.log("Event saved directly to Supabase");
    } catch (error) {
      console.error("Failed to save event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save event";
      if (Platform.OS === "web") alert(errorMessage);
      else Alert.alert("Error", errorMessage);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const deleteEvent = async () => {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        const errorMessage = error.message || "Failed to delete event";
        if (Platform.OS === "web") alert(errorMessage);
        else Alert.alert("Error", errorMessage);
        return;
      }

      await refreshEvents();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this event?")) deleteEvent();
    } else {
      Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteEvent },
      ]);
    }
  };

  const getClassName = (classId: string) => {
    const cls: any = getSourceClasses().find(
      (c: any) => String(c.id) === String(classId),
    );
    if (!cls) return "Unknown Class";
    const ageGroup = cls.age_group ?? cls.ageGroup ?? "";
    return `${cls.name} - ${ageGroup}`;
  };

  const getClassDates = (classId: string) => {
    const classBookings = bookings.filter(
      (b) => b.classId === classId && b.status !== "cancelled",
    );
    const uniqueDates = Array.from(
      new Set(classBookings.map((b) => b.classDate)),
    );
    return uniqueDates.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  };

  const filterClassesByDate = () => {
    const sourceClasses = getSourceClasses();
    if (!searchDate.trim()) return sourceClasses as any[];
    return (sourceClasses as any[]).filter((cls: any) => {
      const classDates = getClassDates(cls.id);
      return classDates.some((date: string) => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          formattedDate.toLowerCase().includes(searchDate.toLowerCase()) ||
          date.includes(searchDate)
        );
      });
    });
  };

  const getBookingsForClassDate = (classId: string, classDate: string) => {
    return bookings.filter(
      (b) =>
        b.classId === classId &&
        b.status !== "cancelled" &&
        b.classDate === classDate,
    );
  };

  const safeDate = (dateString: string) => {
    if (!dateString) return new Date();
    return new Date(`${dateString}T12:00:00`);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatAttendanceDate = (dateString: string) => {
    const d = safeDate(dateString);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSourceClasses = () =>
    (adminClasses.length > 0 ? adminClasses : classes) as any[];

  const getClassesForDay = (day: string | null) => {
    if (!day) return [];
    return getSourceClasses().filter(
      (cls: any) => String(cls.day || "").toLowerCase() === day.toLowerCase(),
    );
  };

  const getParentForBooking = (booking: any) => {
    return allUsers.find(
      (u: any) =>
        String(u.id) === String(booking.profileId) ||
        String(u.userId) === String(booking.profileId),
    );
  };

  const getChildForBooking = (booking: any) => {
    const parent = getParentForBooking(booking);
    return parent?.children?.find(
      (child: any) => String(child.id) === String(booking.childId),
    );
  };

  const getFamilyNameFromParent = (parentName: string) => {
    const parts = String(parentName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  const getUserDisplayName = (u: any) => {
    const firstChild = u?.children?.[0];
    if (!firstChild?.name) return u?.name || "Unnamed student";

    const childName = String(firstChild.name).trim();
    const familyName = getFamilyNameFromParent(u?.name || "");

    if (
      !familyName ||
      childName.toLowerCase().includes(familyName.toLowerCase())
    ) {
      return childName;
    }

    return `${childName} ${familyName}`.trim();
  };

  const getChildrenSummary = (u: any) => {
    const children = u?.children || [];
    if (children.length === 0) return "No children added";
    return children
      .map((child: any) => `${child.name}${child.age ? ` (${child.age})` : ""}`)
      .join(", ");
  };

  const getUniqueStudentCount = (items: any[]) => {
    return new Set(
      items.map(
        (booking: any) =>
          `${booking.profileId || ""}::${booking.childId || ""}`,
      ),
    ).size;
  };

  const normalizeText = (value: any) =>
    String(value ?? "")
      .toLowerCase()
      .trim();

  const getClassById = (classId: any) => {
    return getSourceClasses().find(
      (cls: any) => String(cls.id) === String(classId),
    );
  };

  const isSameClass = (booking: any, cls: any) => {
    if (!booking || !cls) return false;

    const bookingClassId = String(booking.classId ?? "").trim();
    const classId = String(cls.id ?? "").trim();

    if (bookingClassId && classId && bookingClassId === classId) return true;

    const bookingDay = normalizeText(booking.classDay);
    const classDay = normalizeText(cls.day);
    const bookingTime = normalizeText(booking.classTime);
    const classTime = normalizeText(cls.time);

    return (
      !!bookingDay &&
      !!classDay &&
      !!bookingTime &&
      !!classTime &&
      bookingDay === classDay &&
      bookingTime === classTime
    );
  };

  const getBookingsForClass = (classOrId: any) => {
    const cls =
      typeof classOrId === "object" ? classOrId : getClassById(classOrId);

    return bookings.filter(
      (booking: any) =>
        booking.status !== "cancelled" && isSameClass(booking, cls),
    );
  };

  const getBookingDateKey = (booking: any) =>
    String(booking.classDate || booking.bookingDate || "").trim();

  const getBookingsForClassOnDate = (classOrId: any, date?: string) => {
    const selectedDate = String(date || "").trim();
    const classBookings = getBookingsForClass(classOrId);

    if (!selectedDate) return classBookings;

    return classBookings.filter(
      (booking: any) => getBookingDateKey(booking) === selectedDate,
    );
  };

  const getStudentBookingGroupsForClass = (classOrId: any) => {
    const grouped = getBookingsForClass(classOrId).reduce(
      (acc: any, booking: any) => {
        const key = `${booking.profileId || ""}::${booking.childId || ""}`;

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
      },
      {},
    );

    return Object.values(grouped).map((group: any) => ({
      ...group,
      bookings: group.bookings.sort(
        (a: any, b: any) =>
          safeDate(getBookingDateKey(a)).getTime() -
          safeDate(getBookingDateKey(b)).getTime(),
      ),
    }));
  };

  const getWeekdayFromDateString = (dateString: string) => {
    return safeDate(dateString).toLocaleDateString("en-US", {
      weekday: "long",
    });
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
      .filter(
        (booking: any) => booking.status !== "cancelled" && booking.classDate,
      )
      .reduce((acc: any, booking: any) => {
        const dateKey = booking.classDate;

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            classes: {},
            totalStudents: 0,
          };
        }

        const classKey = `${booking.classId}-${booking.classTime || "no-time"}`;
        if (!acc[dateKey].classes[classKey]) {
          acc[dateKey].classes[classKey] = {
            key: classKey,
            classId: booking.classId,
            className: booking.className ?? getClassName(booking.classId),
            classTime: booking.classTime ?? "",
            classDuration: booking.classDuration ?? "",
            bookings: [],
          };
        }

        acc[dateKey].classes[classKey].bookings.push(booking);
        acc[dateKey].totalStudents += 1;
        return acc;
      }, {}),
  ).sort(
    (a: any, b: any) => safeDate(a.date).getTime() - safeDate(b.date).getTime(),
  ) as any[];

  const visibleAttendanceDays = selectedAttendanceDate
    ? attendanceDays.filter((day: any) => day.date === selectedAttendanceDate)
    : attendanceDays;

  const selectedAttendanceDay = selectedAttendanceDate
    ? attendanceDays.find((day: any) => day.date === selectedAttendanceDate)
    : null;

  const selectedAttendanceClasses = selectedAttendanceDay
    ? (Object.values(selectedAttendanceDay.classes).sort((a: any, b: any) =>
        String(a.classTime).localeCompare(String(b.classTime)),
      ) as any[])
    : [];

  const selectedAttendanceClass = selectedAttendanceClassKey
    ? selectedAttendanceClasses.find(
        (cls: any) => cls.key === selectedAttendanceClassKey,
      )
    : null;

  const selectedAttendanceClassMakeupRecords =
    selectedAttendanceClassForDay && selectedAttendanceDate
      ? attendanceRecords.filter(
          (record: any) =>
            record.attendance_type === "makeup" &&
            record.status !== "deleted" &&
            record.attended_date === selectedAttendanceDate &&
            String(record.attended_class_id) ===
              String(selectedAttendanceClassForDay.id),
        )
      : [];

  if (user?.role !== "admin") return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Admin Panel",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "bold" as const },
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerLogoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut color={Colors.white} size={18} />
              <Text style={styles.headerLogoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.sidebar}>
          <ScrollView
            style={styles.sidebarScroll}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "announcements" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("announcements")}
            >
              <Megaphone
                color={
                  activeTab === "announcements" ? Colors.white : Colors.primary
                }
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "announcements" && styles.tabTextActive,
                ]}
              >
                Announcements
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "gallery" && styles.tabActive]}
              onPress={() => setActiveTab("gallery")}
            >
              <ImageIcon
                color={activeTab === "gallery" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "gallery" && styles.tabTextActive,
                ]}
              >
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "coaches" && styles.tabActive]}
              onPress={() => setActiveTab("coaches")}
            >
              <UserCheck
                color={activeTab === "coaches" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "coaches" && styles.tabTextActive,
                ]}
              >
                Coaches
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "classes" && styles.tabActive]}
              onPress={() => setActiveTab("classes")}
            >
              <Book
                color={activeTab === "classes" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "classes" && styles.tabTextActive,
                ]}
              >
                Classes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "events" && styles.tabActive]}
              onPress={() => setActiveTab("events")}
            >
              <CalendarDays
                color={activeTab === "events" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "events" && styles.tabTextActive,
                ]}
              >
                Events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "users" && styles.tabActive]}
              onPress={() => setActiveTab("users")}
            >
              <Users
                color={activeTab === "users" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "users" && styles.tabTextActive,
                ]}
              >
                Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "bookings" && styles.tabActive]}
              onPress={() => setActiveTab("bookings")}
            >
              <Calendar
                color={activeTab === "bookings" ? Colors.white : Colors.primary}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "bookings" && styles.tabTextActive,
                ]}
              >
                Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "attendance" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("attendance")}
            >
              <ClipboardCheck
                color={
                  activeTab === "attendance" ? Colors.white : Colors.primary
                }
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "attendance" && styles.tabTextActive,
                ]}
              >
                Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, styles.logoutTab]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut color={Colors.danger} size={20} />
              <Text style={[styles.tabText, styles.logoutTabText]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === "announcements" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddAnnouncement}
                >
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
              {announcements.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.announcementInfo}>
                      <Text style={styles.announcementTitle}>{item.title}</Text>
                      <Text style={styles.announcementMessage}>
                        {item.message}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          item.type === "promotion" && styles.typePromotion,
                          item.type === "event" && styles.typeEvent,
                        ]}
                      >
                        <Text style={styles.typeText}>{item.type}</Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditAnnouncement(item)}
                      >
                        <Edit2 color={Colors.primary} size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteAnnouncement(item.id)}
                      >
                        <Trash2 color={Colors.danger} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "gallery" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddGallery}
                >
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
              {galleryItems.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.galleryInfo}>
                      {!!item.url && (
                        <Image
                          source={{ uri: item.url }}
                          style={styles.galleryThumb}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.galleryTextWrap}>
                        <Text style={styles.galleryUrl} numberOfLines={1}>
                          {item.url}
                        </Text>
                        <Text style={styles.galleryCaption}>
                          {item.caption}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditGallery(item)}
                      >
                        <Edit2 color={Colors.primary} size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteGallery(item.id)}
                      >
                        <Trash2 color={Colors.danger} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "coaches" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Coaches</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddCoach}
                >
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
              {dbCoaches.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.coachInfo}>
                      <Text style={styles.coachName}>{item.name}</Text>
                      <Text style={styles.coachDetail}>
                        {item.specialization}
                      </Text>
                      <Text style={styles.coachDetail}>{item.experience}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditCoach(item)}
                      >
                        <Edit2 color={Colors.primary} size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteCoach(item.id)}
                      >
                        <Trash2 color={Colors.danger} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "classes" && (
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
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddClass}
                  >
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
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => {
                      const dayClasses = getSourceClasses().filter(
                        (cls: any) =>
                          String(cls.day).toLowerCase() === day.toLowerCase(),
                      );

                      return (
                        <TouchableOpacity
                          key={day}
                          style={styles.attendanceDayCard}
                          onPress={() => setSelectedClassesDay(day)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.attendanceDayTitle}>{day}</Text>
                          <Text style={styles.attendanceDayCount}>
                            {dayClasses.length} classes
                          </Text>
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

                  <Text style={styles.attendanceStepTitle}>
                    {selectedClassesDay} Classes
                  </Text>

                  {getSourceClasses()
                    .filter(
                      (item: any) =>
                        String(item.day).toLowerCase() ===
                        selectedClassesDay.toLowerCase(),
                    )
                    .sort((a: any, b: any) =>
                      String(a.time).localeCompare(String(b.time)),
                    )
                    .map((item: any) => {
                      const ageGroup = item.age_group ?? item.ageGroup ?? "";

                      return (
                        <View key={item.id} style={styles.card}>
                          <View style={styles.cardHeader}>
                            <View style={styles.classInfo}>
                              <Text style={styles.className}>
                                {item.name} - {ageGroup}
                              </Text>
                              <Text style={styles.classDetail}>
                                {item.day} {item.time} ({item.duration})
                              </Text>
                              <Text style={styles.classDetail}>
                                {item.level} - {item.enrolled}/{item.capacity}{" "}
                                enrolled
                              </Text>
                            </View>

                            <View style={styles.cardActions}>
                              <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handleEditClass(item)}
                              >
                                <Edit2 color={Colors.primary} size={20} />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handleDeleteClass(item.id)}
                              >
                                <Trash2 color={Colors.danger} size={20} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}

                  {getSourceClasses().filter(
                    (item: any) =>
                      String(item.day).toLowerCase() ===
                      selectedClassesDay.toLowerCase(),
                  ).length === 0 && (
                    <Text style={styles.emptyStateText}>
                      No classes available on {selectedClassesDay}.
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
          {activeTab === "events" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Events</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddEvent}
                >
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>
              {(dbEvents || []).map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      <Text style={styles.eventDetail}>
                        {item.date} at {item.time}
                      </Text>
                      <Text style={styles.eventDetail}>
                        {item.type} - {item.location}
                      </Text>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditEvent(item)}
                      >
                        <Edit2 color={Colors.primary} size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteEvent(item.id)}
                      >
                        <Trash2 color={Colors.danger} size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "users" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Students / Accounts</Text>
                  <Text style={styles.attendanceSubtitle}>
                    Search and tap a student to view their progress.
                  </Text>
                  <Text style={styles.userCountText}>
                    Total Users: {allUsers.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleOpenCreateUserModal}
                >
                  <Plus color={Colors.white} size={20} />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Search child, parent, phone, or email..."
                style={styles.input}
                value={userSearch}
                onChangeText={setUserSearch}
              />

              {usersLoading ? (
                <Text style={styles.emptyStateText}>Loading...</Text>
              ) : allUsers.length === 0 ? (
                <Text style={styles.emptyStateText}>No users found</Text>
              ) : (
                allUsers
                  .flatMap((u) =>
                    u.children && u.children.length > 0
                      ? u.children.map((child: any) => ({ parent: u, child }))
                      : [{ parent: u, child: null }],
                  )
                  .filter(({ parent, child }: any) => {
                    const search = userSearch.trim().toLowerCase();
                    if (!search) return true;

                    return (
                      String(child?.name || "")
                        .toLowerCase()
                        .includes(search) ||
                      String(child?.age || "")
                        .toLowerCase()
                        .includes(search) ||
                      String(parent?.name || "")
                        .toLowerCase()
                        .includes(search) ||
                      String(parent?.username || "")
                        .toLowerCase()
                        .includes(search) ||
                      String(parent?.phoneNumber || "")
                        .toLowerCase()
                        .includes(search) ||
                      String(parent?.email || "")
                        .toLowerCase()
                        .includes(search)
                    );
                  })
                  .map(({ parent, child }: any) => (
                    <TouchableOpacity
                      key={child?.id || parent.id}
                      style={styles.card}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (child?.id) {
                          router.push({
                            pathname: "/admin/user-progress",
                            params: {
                              childId: child.id,
                              parentId: parent.id,
                            },
                          } as any);
                        }
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {child?.name || parent.name}
                          </Text>
                          <Text style={styles.userRole}>
                            Parent: {parent.name}
                          </Text>

                          {child?.age ? (
                            <Text style={styles.userDetail}>
                              Age: {child.age}
                            </Text>
                          ) : null}

                          {!!parent.phoneNumber && (
                            <Text style={styles.userDetail}>
                              Phone: {parent.phoneNumber}
                            </Text>
                          )}

                          <Text style={styles.userDetail}>
                            Email: {parent.email || "No email"}
                          </Text>

                          <Text style={styles.userDetail}>
                            {child?.id
                              ? "Tap to view progress"
                              : "No child attached"}
                          </Text>
                        </View>

                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleEditUser(parent, child);
                            }}
                          >
                            <Edit2 color={Colors.primary} size={20} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.resetPasswordButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleResetPassword(parent.userId);
                            }}
                          >
                            <Text style={styles.resetPasswordButtonText}>
                              Reset
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleDeleteUser(parent.userId);
                            }}
                          >
                            <Trash2 color={Colors.danger} size={20} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </View>
          )}

          {activeTab === "bookings" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Bookings</Text>
                  <Text style={styles.attendanceSubtitle}>
                    Choose a day, choose a class, then manage the booked
                    students.
                  </Text>
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
                placeholder="Search student, parent, or phone..."
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
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => {
                      const dayClasses = getClassesForDay(day);
                      const dayBookings = bookings.filter(
                        (booking: any) =>
                          booking.status !== "cancelled" &&
                          String(booking.classDay).toLowerCase() ===
                            day.toLowerCase(),
                      );
                      const uniqueStudentCount =
                        getUniqueStudentCount(dayBookings);

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
                          <Text style={styles.attendanceDayCount}>
                            {dayClasses.length} classes • {uniqueStudentCount}{" "}
                            students
                          </Text>
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

                  <Text style={styles.attendanceStepTitle}>
                    {selectedBookingDay} Classes
                  </Text>

                  <View style={styles.attendanceClassGrid}>
                    {getClassesForDay(selectedBookingDay)
                      .sort((a: any, b: any) =>
                        String(a.time).localeCompare(String(b.time)),
                      )
                      .map((cls: any) => {
                        const classBookings = getBookingsForClass(cls);
                        const uniqueStudentCount =
                          getUniqueStudentCount(classBookings);

                        return (
                          <TouchableOpacity
                            key={cls.id}
                            style={styles.attendanceClassCard}
                            onPress={() => setSelectedBookingClass(cls)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.attendanceClassName}>
                              {cls.name} - {cls.age_group || cls.ageGroup || ""}
                            </Text>
                            <Text style={styles.attendanceClassTime}>
                              {cls.time || "No time"}
                              {cls.duration ? ` • ${cls.duration}` : ""}
                            </Text>
                            <Text style={styles.attendanceClassCount}>
                              {uniqueStudentCount} students booked
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>

                  {getClassesForDay(selectedBookingDay).length === 0 && (
                    <Text style={styles.emptyStateText}>
                      No classes available on {selectedBookingDay}.
                    </Text>
                  )}
                </View>
              ) : selectedBookingClass ? (
                <View>
                  <TouchableOpacity
                    style={styles.backToClassesButton}
                    onPress={() => setSelectedBookingClass(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.backToClassesText}>
                      ← Back to classes
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.attendanceSelectedHeader}>
                    <View>
                      <Text style={styles.attendanceStepTitle}>
                        {selectedBookingDay}
                      </Text>
                      <Text style={styles.attendanceClassName}>
                        {selectedBookingClass.name} -{" "}
                        {selectedBookingClass.age_group ||
                          selectedBookingClass.ageGroup ||
                          ""}
                      </Text>
                      <Text style={styles.attendanceClassTime}>
                        {selectedBookingClass.time || "No time"}
                        {selectedBookingClass.duration
                          ? ` • ${selectedBookingClass.duration}`
                          : ""}
                      </Text>
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
                        String(parent?.name || "")
                          .toLowerCase()
                          .includes(search) ||
                        String(parent?.phoneNumber || "")
                          .toLowerCase()
                          .includes(search) ||
                        String(child?.name || "")
                          .toLowerCase()
                          .includes(search)
                      );
                    })
                    .map((group: any) => {
                      const firstBooking = group.bookings[0];
                      const parent = getParentForBooking(firstBooking);
                      const child = getChildForBooking(firstBooking);

                      return (
                        <View
                          key={group.key}
                          style={styles.attendanceStudentCard}
                        >
                          <View style={styles.attendanceStudentInfo}>
                            <Text style={styles.attendanceName}>
                              {child?.name || "Unknown student"}
                            </Text>
                            <Text style={styles.attendanceParent}>
                              Parent: {parent?.name || "Unknown parent"}
                            </Text>
                            {!!parent?.phoneNumber && (
                              <Text style={styles.attendanceStatus}>
                                Phone: {parent.phoneNumber}
                              </Text>
                            )}

                            <View style={styles.bookingDatesWrap}>
                              {group.bookings.map((booking: any) => (
                                <View
                                  key={booking.id}
                                  style={styles.bookingDatePill}
                                >
                                  <Text style={styles.bookingDatePillText}>
                                    {getBookingDateKey(booking)
                                      ? formatAttendanceDate(
                                          getBookingDateKey(booking),
                                        )
                                      : "No date"}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>

                          <View style={styles.attendanceActions}>
                            <TouchableOpacity
                              style={styles.bookingEditButton}
                              onPress={() => handleEditBooking(group)}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.bookingEditButtonText}>
                                Manage Dates
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}

                  {getStudentBookingGroupsForClass(selectedBookingClass)
                    .length === 0 && (
                    <Text style={styles.emptyStateText}>
                      No bookings available for this class.
                    </Text>
                  )}
                </View>
              ) : null}
            </View>
          )}

          {activeTab === "attendance" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Attendance</Text>
                  <Text style={styles.attendanceSubtitle}>
                    Pick a date, choose the class, then mark attendance.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.smallActionButton}
                  onPress={() => {
                    refreshBookings();
                    refreshAttendanceRecords();
                    refreshPrivateAttendanceSessions();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.smallActionButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[
                    styles.attendanceFilterButton,
                    attendanceType !== "class" &&
                      styles.attendanceFilterButtonSecondary,
                  ]}
                  onPress={() => setAttendanceType("class")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={
                      attendanceType === "class"
                        ? styles.attendanceFilterButtonText
                        : styles.attendanceFilterButtonSecondaryText
                    }
                  >
                    Class Attendance
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.attendanceFilterButton,
                    attendanceType !== "private" &&
                      styles.attendanceFilterButtonSecondary,
                  ]}
                  onPress={() => setAttendanceType("private")}
                  activeOpacity={0.85}
                >
                  <Text
                    style={
                      attendanceType === "private"
                        ? styles.attendanceFilterButtonText
                        : styles.attendanceFilterButtonSecondaryText
                    }
                  >
                    Private Attendance
                  </Text>
                </TouchableOpacity>
              </View>

              {attendanceType === "private" && (
                <View>
                  <View style={styles.attendanceFilterBox}>
                    <Text style={styles.attendanceFilterLabel}>
                      Private attendance date
                    </Text>
                    <View style={styles.attendanceFilterRow}>
                      <TouchableOpacity
                        style={styles.attendanceFilterButton}
                        onPress={() => setAttendanceDateFromDate(new Date())}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.attendanceFilterButtonText}>
                          Today
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.attendanceFilterButtonSecondary}
                        onPress={() => setShowAttendanceDatePicker(true)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={styles.attendanceFilterButtonSecondaryText}
                        >
                          Pick Date 📅
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.attendanceFilterButtonSecondary}
                        onPress={() => {
                          setSelectedAttendanceDate("");
                          setSelectedAttendanceWeekDay(null);
                          setSelectedAttendanceClassForDay(null);
                          setAttendanceSearch("");
                          setShowAttendanceDatePicker(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={styles.attendanceFilterButtonSecondaryText}
                        >
                          Clear
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {selectedAttendanceDate ? (
                      <Text style={styles.attendanceSelectedDateText}>
                        {formatAttendanceDate(selectedAttendanceDate)}
                      </Text>
                    ) : (
                      <Text style={styles.attendanceSelectedDateText}>
                        No date selected
                      </Text>
                    )}

                    {showAttendanceDatePicker &&
                      Platform.OS === "web" &&
                      React.createElement("input", {
                        type: "date",
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
                          border: "1px solid #ddd",
                          fontSize: 15,
                          maxWidth: 220,
                        },
                      })}

                    {showAttendanceDatePicker && Platform.OS !== "web" && (
                      <View style={styles.nativePickerBox}>
                        <DateTimePicker
                          value={attendancePickerDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={(event: any, selectedDate?: Date) => {
                            if (Platform.OS === "android") {
                              setShowAttendanceDatePicker(false);
                            }

                            if (event?.type === "dismissed") return;

                            if (selectedDate) {
                              setAttendanceDateFromDate(selectedDate);
                            }
                          }}
                        />

                        {Platform.OS === "ios" && (
                          <TouchableOpacity
                            style={styles.attendanceFilterButton}
                            onPress={() => setShowAttendanceDatePicker(false)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.attendanceFilterButtonText}>
                              Done
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <TextInput
                    placeholder="Search private student, parent, phone, or description..."
                    style={styles.input}
                    value={attendanceSearch}
                    onChangeText={setAttendanceSearch}
                  />

                  {!selectedAttendanceDate ? (
                    <Text style={styles.emptyStateText}>
                      Select a date to see that day’s private sessions.
                    </Text>
                  ) : (
                    <>
                      {privateAttendanceSessions
                        .filter((session: any) => {
                          const sessionDateKey = String(
                            session.session_date || "",
                          ).slice(0, 10);
                          if (sessionDateKey !== selectedAttendanceDate)
                            return false;

                          const search = attendanceSearch.trim().toLowerCase();
                          if (!search) return true;

                          return (
                            String(session.child?.name || "")
                              .toLowerCase()
                              .includes(search) ||
                            String(session.parent?.name || "")
                              .toLowerCase()
                              .includes(search) ||
                            String(session.parent?.phone_number || "")
                              .toLowerCase()
                              .includes(search) ||
                            String(session.privateBooking?.description || "")
                              .toLowerCase()
                              .includes(search)
                          );
                        })
                        .map((session: any) => {
                          const statusText =
                            session.attended === true
                              ? "Present"
                              : session.attended === false
                                ? "Absent"
                                : "Not marked";

                          return (
                            <View
                              key={session.id}
                              style={styles.attendanceStudentCard}
                            >
                              <View style={styles.attendanceStudentInfo}>
                                <Text style={styles.attendanceName}>
                                  {session.child?.name || "Unknown student"}
                                </Text>
                                <Text style={styles.attendanceParent}>
                                  Parent:{" "}
                                  {session.parent?.name || "Unknown parent"}
                                </Text>
                                {!!session.parent?.phone_number && (
                                  <Text style={styles.attendanceStatus}>
                                    Phone: {session.parent.phone_number}
                                  </Text>
                                )}
                                <Text style={styles.attendanceStatus}>
                                  Date:{" "}
                                  {formatAttendanceDate(session.session_date)}
                                </Text>
                                <Text style={styles.attendanceStatus}>
                                  Status: {statusText}
                                </Text>
                                {!!session.privateBooking?.description && (
                                  <Text style={styles.makeupNoteText}>
                                    Description:{" "}
                                    {session.privateBooking.description}
                                  </Text>
                                )}
                                {!!session.note && (
                                  <Text style={styles.makeupNoteText}>
                                    Note: {session.note}
                                  </Text>
                                )}
                              </View>

                              <View style={styles.attendanceActions}>
                                <TouchableOpacity
                                  style={[
                                    styles.attendancePresentButton,
                                    session.attended === true &&
                                      styles.attendanceButtonActive,
                                  ]}
                                  onPress={() =>
                                    handleMarkPrivateAttendance(
                                      session.id,
                                      true,
                                    )
                                  }
                                  activeOpacity={0.85}
                                >
                                  <Text
                                    style={[
                                      styles.attendanceButtonText,
                                      session.attended === true &&
                                        styles.attendanceButtonTextActive,
                                    ]}
                                  >
                                    Present
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.attendanceAbsentButton,
                                    session.attended === false &&
                                      styles.attendanceAbsentButtonActive,
                                  ]}
                                  onPress={() =>
                                    handleMarkPrivateAttendance(
                                      session.id,
                                      false,
                                    )
                                  }
                                  activeOpacity={0.85}
                                >
                                  <Text
                                    style={[
                                      styles.attendanceAbsentText,
                                      session.attended === false &&
                                        styles.attendanceButtonTextActive,
                                    ]}
                                  >
                                    Absent
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}

                      {privateAttendanceSessions.filter(
                        (session: any) =>
                          String(session.session_date || "").slice(0, 10) ===
                          selectedAttendanceDate,
                      ).length === 0 && (
                        <Text style={styles.emptyStateText}>
                          No private sessions found for this date.
                        </Text>
                      )}
                    </>
                  )}
                </View>
              )}

              {attendanceType === "class" && (
                <>
                  <View style={styles.attendanceFilterBox}>
                    <Text style={styles.attendanceFilterLabel}>
                      Attendance date
                    </Text>
                    <View style={styles.attendanceFilterRow}>
                      <TouchableOpacity
                        style={styles.attendanceFilterButton}
                        onPress={() => setAttendanceDateFromDate(new Date())}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.attendanceFilterButtonText}>
                          Today
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.attendanceFilterButtonSecondary}
                        onPress={() => setShowAttendanceDatePicker(true)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={styles.attendanceFilterButtonSecondaryText}
                        >
                          Pick Date 📅
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.attendanceFilterButtonSecondary}
                        onPress={() => {
                          setSelectedAttendanceDate("");
                          setSelectedAttendanceWeekDay(null);
                          setSelectedAttendanceClassForDay(null);
                          setAttendanceSearch("");
                          setShowAttendanceDatePicker(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={styles.attendanceFilterButtonSecondaryText}
                        >
                          Clear
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {selectedAttendanceDate ? (
                      <Text style={styles.attendanceSelectedDateText}>
                        {formatAttendanceDate(selectedAttendanceDate)}
                      </Text>
                    ) : (
                      <Text style={styles.attendanceSelectedDateText}>
                        No date selected
                      </Text>
                    )}

                    {showAttendanceDatePicker &&
                      Platform.OS === "web" &&
                      React.createElement("input", {
                        type: "date",
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
                          border: "1px solid #ddd",
                          fontSize: 15,
                          maxWidth: 220,
                        },
                      })}

                    {showAttendanceDatePicker && Platform.OS !== "web" && (
                      <View style={styles.nativePickerBox}>
                        <DateTimePicker
                          value={attendancePickerDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={(event: any, selectedDate?: Date) => {
                            if (Platform.OS === "android") {
                              setShowAttendanceDatePicker(false);
                            }

                            if (event?.type === "dismissed") return;

                            if (selectedDate) {
                              setAttendanceDateFromDate(selectedDate);
                            }
                          }}
                        />

                        {Platform.OS === "ios" && (
                          <TouchableOpacity
                            style={styles.attendanceFilterButton}
                            onPress={() => setShowAttendanceDatePicker(false)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.attendanceFilterButtonText}>
                              Done
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <TextInput
                    placeholder="Search student, parent, or phone..."
                    style={styles.input}
                    value={attendanceSearch}
                    onChangeText={setAttendanceSearch}
                  />

                  {bookingsLoading ? (
                    <Text style={styles.emptyStateText}>
                      Loading attendance...
                    </Text>
                  ) : !selectedAttendanceDate || !selectedAttendanceWeekDay ? (
                    <Text style={styles.emptyStateText}>
                      Select a date to see that day’s classes.
                    </Text>
                  ) : selectedAttendanceWeekDay &&
                    !selectedAttendanceClassForDay ? (
                    <View>
                      <Text style={styles.attendanceStepTitle}>
                        {selectedAttendanceWeekDay} Classes
                      </Text>
                      <Text style={styles.attendanceStepSubtitle}>
                        {formatAttendanceDate(selectedAttendanceDate)}
                      </Text>

                      <View style={styles.attendanceClassGrid}>
                        {getClassesForDay(selectedAttendanceWeekDay)
                          .sort((a: any, b: any) =>
                            String(a.time).localeCompare(String(b.time)),
                          )
                          .map((cls: any) => {
                            const classBookings = getBookingsForClassOnDate(
                              cls,
                              selectedAttendanceDate,
                            );
                            const makeupCount = attendanceRecords.filter(
                              (record: any) =>
                                record.attendance_type === "makeup" &&
                                record.status !== "deleted" &&
                                record.attended_date ===
                                  selectedAttendanceDate &&
                                String(record.attended_class_id) ===
                                  String(cls.id),
                            ).length;
                            const present =
                              classBookings.filter(
                                (b: any) => b.attended === true,
                              ).length + makeupCount;
                            const absent = classBookings.filter(
                              (b: any) => b.attended === false,
                            ).length;

                            return (
                              <TouchableOpacity
                                key={cls.id}
                                style={styles.attendanceClassCard}
                                onPress={() =>
                                  setSelectedAttendanceClassForDay(cls)
                                }
                                activeOpacity={0.85}
                              >
                                <Text style={styles.attendanceClassName}>
                                  {cls.name} -{" "}
                                  {cls.age_group || cls.ageGroup || ""}
                                </Text>
                                <Text style={styles.attendanceClassTime}>
                                  {cls.time || "No time"}
                                  {cls.duration ? ` • ${cls.duration}` : ""}
                                </Text>
                                <Text style={styles.attendanceClassCount}>
                                  {classBookings.length + makeupCount} students
                                </Text>
                                <Text style={styles.attendanceClassStats}>
                                  {present} present • {absent} absent
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                      </View>

                      {getClassesForDay(selectedAttendanceWeekDay).length ===
                        0 && (
                        <Text style={styles.emptyStateText}>
                          No classes available on {selectedAttendanceWeekDay}.
                        </Text>
                      )}
                    </View>
                  ) : selectedAttendanceClassForDay ? (
                    <View>
                      <TouchableOpacity
                        style={styles.backToClassesButton}
                        onPress={() => setSelectedAttendanceClassForDay(null)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.backToClassesText}>
                          ← Back to classes
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.attendanceSelectedHeader}>
                        <View>
                          <Text style={styles.attendanceStepTitle}>
                            {formatAttendanceDate(selectedAttendanceDate)}
                          </Text>
                          <Text style={styles.attendanceClassName}>
                            {selectedAttendanceClassForDay.name} -{" "}
                            {selectedAttendanceClassForDay.age_group ||
                              selectedAttendanceClassForDay.ageGroup ||
                              ""}
                          </Text>
                          <Text style={styles.attendanceClassTime}>
                            {selectedAttendanceClassForDay.time || "No time"}
                            {selectedAttendanceClassForDay.duration
                              ? ` • ${selectedAttendanceClassForDay.duration}`
                              : ""}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.makeupAddButton}
                          onPress={handleOpenMakeupModal}
                          activeOpacity={0.85}
                        >
                          <Plus color={Colors.white} size={16} />
                          <Text style={styles.makeupAddButtonText}>
                            Replace Session / Make-Up
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {getBookingsForClassOnDate(
                        selectedAttendanceClassForDay,
                        selectedAttendanceDate,
                      )
                        .filter((booking: any) => {
                          const parent = getParentForBooking(booking);
                          const child = getChildForBooking(booking);
                          const search = attendanceSearch.trim().toLowerCase();
                          if (!search) return true;
                          return (
                            String(parent?.name || "")
                              .toLowerCase()
                              .includes(search) ||
                            String(parent?.phoneNumber || "")
                              .toLowerCase()
                              .includes(search) ||
                            String(child?.name || "")
                              .toLowerCase()
                              .includes(search)
                          );
                        })
                        .map((booking: any) => {
                          const parent = getParentForBooking(booking);
                          const child = getChildForBooking(booking);
                          const statusText =
                            booking.attended === true
                              ? "Present"
                              : booking.attended === false
                                ? "Absent"
                                : "Not marked";

                          return (
                            <View
                              key={booking.id}
                              style={styles.attendanceStudentCard}
                            >
                              <View style={styles.attendanceStudentInfo}>
                                <Text style={styles.attendanceName}>
                                  {child?.name || "Unknown student"}
                                </Text>
                                <Text style={styles.attendanceParent}>
                                  Parent: {parent?.name || "Unknown parent"}
                                </Text>
                                {!!parent?.phoneNumber && (
                                  <Text style={styles.attendanceStatus}>
                                    Phone: {parent.phoneNumber}
                                  </Text>
                                )}
                                <Text style={styles.attendanceStatus}>
                                  Status: {statusText}
                                </Text>
                              </View>

                              <View style={styles.attendanceActions}>
                                <TouchableOpacity
                                  style={[
                                    styles.attendancePresentButton,
                                    booking.attended === true &&
                                      styles.attendanceButtonActive,
                                  ]}
                                  onPress={() =>
                                    handleMarkAttendance(booking.id, true)
                                  }
                                  activeOpacity={0.85}
                                >
                                  <Text
                                    style={[
                                      styles.attendanceButtonText,
                                      booking.attended === true &&
                                        styles.attendanceButtonTextActive,
                                    ]}
                                  >
                                    Present
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.attendanceAbsentButton,
                                    booking.attended === false &&
                                      styles.attendanceAbsentButtonActive,
                                  ]}
                                  onPress={() =>
                                    handleMarkAttendance(booking.id, false)
                                  }
                                  activeOpacity={0.85}
                                >
                                  <Text
                                    style={[
                                      styles.attendanceAbsentText,
                                      booking.attended === false &&
                                        styles.attendanceButtonTextActive,
                                    ]}
                                  >
                                    Absent
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}

                      {selectedAttendanceClassMakeupRecords.map(
                        (record: any) => {
                          const parent = allUsers.find(
                            (u: any) =>
                              String(u.id) === String(record.profile_id),
                          );
                          const child = parent?.children?.find(
                            (c: any) =>
                              String(c.id) === String(record.child_id),
                          );

                          return (
                            <View
                              key={record.id}
                              style={[
                                styles.attendanceStudentCard,
                                styles.makeupStudentCard,
                              ]}
                            >
                              <View style={styles.attendanceStudentInfo}>
                                <Text style={styles.attendanceName}>
                                  {child?.name || "Unknown make-up student"}
                                </Text>
                                <Text style={styles.attendanceParent}>
                                  Parent: {parent?.name || "Unknown parent"}
                                </Text>
                                {!!parent?.phoneNumber && (
                                  <Text style={styles.attendanceStatus}>
                                    Phone: {parent.phoneNumber}
                                  </Text>
                                )}
                                <Text style={styles.attendanceStatus}>
                                  Status: Present • Make-up
                                </Text>
                                {!!record.note && (
                                  <Text style={styles.makeupNoteText}>
                                    Note: {record.note}
                                  </Text>
                                )}
                              </View>

                              <View style={styles.attendanceActions}>
                                <View
                                  style={[
                                    styles.attendancePresentButton,
                                    styles.attendanceButtonActive,
                                  ]}
                                >
                                  <Text
                                    style={styles.attendanceButtonTextActive}
                                  >
                                    Present
                                  </Text>
                                </View>

                                <TouchableOpacity
                                  style={styles.attendanceAbsentButton}
                                  onPress={() =>
                                    handleDeleteMakeupRecord(record.id)
                                  }
                                  activeOpacity={0.85}
                                >
                                  <Text style={styles.attendanceAbsentText}>
                                    Remove
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        },
                      )}

                      {getBookingsForClassOnDate(
                        selectedAttendanceClassForDay,
                        selectedAttendanceDate,
                      ).length === 0 &&
                        selectedAttendanceClassMakeupRecords.length === 0 && (
                          <Text style={styles.emptyStateText}>
                            No active/enrolled kids in this class for this date.
                          </Text>
                        )}
                    </View>
                  ) : null}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {showAnnouncementModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAnnouncement ? "Edit" : "Add"} Announcement
              </Text>
              <TouchableOpacity onPress={() => setShowAnnouncementModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={announcementForm.title}
                onChangeText={(text) =>
                  setAnnouncementForm({ ...announcementForm, title: text })
                }
              />
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={announcementForm.message}
                onChangeText={(text) =>
                  setAnnouncementForm({ ...announcementForm, message: text })
                }
                multiline
                numberOfLines={4}
              />
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                {(["info", "event", "promotion"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      announcementForm.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setAnnouncementForm({ ...announcementForm, type })
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        announcementForm.type === type &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={announcementForm.date}
                onChangeText={(text) =>
                  setAnnouncementForm({ ...announcementForm, date: text })
                }
                placeholder="YYYY-MM-DD"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowAnnouncementModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveAnnouncement}
                >
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
              <Text style={styles.modalTitle}>
                {editingGalleryItem ? "Edit" : "Add"} Gallery Item
              </Text>
              <TouchableOpacity onPress={() => setShowGalleryModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity
                style={[
                  styles.uploadImageButton,
                  galleryUploading && styles.uploadImageButtonDisabled,
                ]}
                onPress={handlePickGalleryImage}
                disabled={galleryUploading}
                activeOpacity={0.85}
              >
                <ImageIcon color={Colors.white} size={18} />
                <Text style={styles.uploadImageButtonText}>
                  {galleryUploading ? "Uploading..." : "Upload Photo"}
                </Text>
              </TouchableOpacity>

              {!!galleryForm.url && (
                <View style={styles.galleryPreviewBox}>
                  <Image
                    source={{ uri: galleryForm.url }}
                    style={styles.galleryPreviewImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.galleryPreviewText} numberOfLines={1}>
                    Image uploaded
                  </Text>
                </View>
              )}

              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.input}
                value={galleryForm.caption}
                onChangeText={(text) =>
                  setGalleryForm({ ...galleryForm, caption: text })
                }
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowGalleryModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    galleryUploading && styles.buttonDisabled,
                  ]}
                  onPress={handleSaveGallery}
                  disabled={galleryUploading}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {galleryUploading ? "Uploading..." : "Save"}
                  </Text>
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
              <Text style={styles.modalTitle}>
                {editingCoach ? "Edit" : "Add"} Coach
              </Text>
              <TouchableOpacity onPress={() => setShowCoachModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={coachForm.name}
                onChangeText={(text) =>
                  setCoachForm({ ...coachForm, name: text })
                }
              />
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                value={coachForm.specialization}
                onChangeText={(text) =>
                  setCoachForm({ ...coachForm, specialization: text })
                }
              />
              <Text style={styles.label}>Experience</Text>
              <TextInput
                style={styles.input}
                value={coachForm.experience}
                onChangeText={(text) =>
                  setCoachForm({ ...coachForm, experience: text })
                }
              />
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={coachForm.bio}
                onChangeText={(text) =>
                  setCoachForm({ ...coachForm, bio: text })
                }
                multiline
                numberOfLines={4}
              />
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={coachForm.imageUrl}
                onChangeText={(text) =>
                  setCoachForm({ ...coachForm, imageUrl: text })
                }
              />
              <Text style={styles.label}>Rating</Text>
              <TextInput
                style={styles.input}
                value={String(coachForm.rating)}
                onChangeText={(text) =>
                  setCoachForm({
                    ...coachForm,
                    rating: parseFloat(text) || 5.0,
                  })
                }
                keyboardType="numeric"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowCoachModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveCoach}
                >
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
              <Text style={styles.modalTitle}>
                {editingClass ? "Edit" : "Add"} Class
              </Text>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={classForm.name}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, name: text })
                }
              />
              <Text style={styles.label}>Age Group</Text>
              <TextInput
                style={styles.input}
                value={classForm.ageGroup}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, ageGroup: text })
                }
                placeholder="e.g., 3-5 years"
              />
              <Text style={styles.label}>Level</Text>
              <View style={styles.typeButtons}>
                {(["Beginner", "Intermediate", "Advanced"] as const).map(
                  (level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.typeButton,
                        classForm.level === level && styles.typeButtonActive,
                      ]}
                      onPress={() => setClassForm({ ...classForm, level })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          classForm.level === level &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
              <Text style={styles.label}>Day</Text>
              <View style={styles.typeButtons}>
                {(
                  [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ] as const
                ).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.typeButton,
                      classForm.day === day && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setClassForm({
                        ...classForm,
                        day,
                        dayOfWeek: getDayOfWeekNumber(day),
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        classForm.day === day && styles.typeButtonTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={classForm.time}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, time: text })
                }
                placeholder="e.g., 4:30 PM"
              />
              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                value={classForm.duration}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, duration: text })
                }
                placeholder="e.g., 60 min"
              />
              <Text style={styles.label}>Coach ID</Text>
              <TextInput
                style={styles.input}
                value={classForm.coachId}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, coachId: text })
                }
              />
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.input}
                value={String(classForm.capacity)}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, capacity: parseInt(text) || 30 })
                }
                keyboardType="numeric"
              />
              <Text style={styles.label}>Enrolled</Text>
              <TextInput
                style={styles.input}
                value={String(classForm.enrolled)}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, enrolled: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={classForm.description}
                onChangeText={(text) =>
                  setClassForm({ ...classForm, description: text })
                }
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowClassModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveClass}
                >
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
              <Text style={styles.modalTitle}>
                {editingEvent ? "Edit" : "Add"} Event
              </Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={eventForm.title}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, title: text })
                }
              />
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={eventForm.date}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, date: text })
                }
                placeholder="YYYY-MM-DD"
              />
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={eventForm.time}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, time: text })
                }
                placeholder="e.g., 6:30 PM"
              />
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                {(["Competition", "Workshop", "Showcase", "Camp"] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        eventForm.type === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setEventForm({ ...eventForm, type })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          eventForm.type === type &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={eventForm.description}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, description: text })
                }
                multiline
                numberOfLines={4}
              />
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={eventForm.location}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, location: text })
                }
              />
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={eventForm.imageUrl}
                onChangeText={(text) =>
                  setEventForm({ ...eventForm, imageUrl: text })
                }
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowEventModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveEvent}
                >
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showMakeupModal && selectedAttendanceClassForDay && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Replace Session / Make-Up</Text>
              <TouchableOpacity onPress={() => setShowMakeupModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Class</Text>
              <Text style={styles.makeupContextText}>
                {selectedAttendanceClassForDay.name} -{" "}
                {selectedAttendanceClassForDay.age_group ||
                  selectedAttendanceClassForDay.ageGroup ||
                  ""}{" "}
                • {formatAttendanceDate(selectedAttendanceDate)}
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
                      style={[
                        styles.makeupResultCard,
                        isSelected && styles.makeupResultCardActive,
                      ]}
                      onPress={() => setSelectedMakeupChild(child)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.makeupResultName,
                          isSelected && styles.makeupResultNameActive,
                        ]}
                      >
                        {child.name}
                      </Text>
                      <Text
                        style={[
                          styles.makeupResultParent,
                          isSelected && styles.makeupResultParentActive,
                        ]}
                      >
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
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowMakeupModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    !selectedMakeupChild && styles.buttonDisabled,
                  ]}
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
          <View style={[styles.modalContent, styles.bookingManageModalContent]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Manage Booking Dates</Text>
                <Text style={styles.bookingManageSubtitle}>
                  {editingBooking.className || "Class booking"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setEditingBooking(null)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.bookingManageInfoBox}>
                <Text style={styles.bookingManageInfoLabel}>Student</Text>
                <Text style={styles.bookingManageInfoText}>
                  {getChildForBooking(editingBooking)?.name ||
                    "Unknown student"}
                </Text>
                <Text style={styles.bookingManageInfoLabel}>Parent</Text>
                <Text style={styles.bookingManageInfoText}>
                  {getParentForBooking(editingBooking)?.name ||
                    "Unknown parent"}
                </Text>
              </View>

              <Text style={styles.label}>Booked Dates</Text>

              {(Array.isArray(editingBooking.editingBookings)
                ? editingBooking.editingBookings
                : [editingBooking]
              )
                .filter((booking: any) => booking.status !== "cancelled")
                .sort(
                  (a: any, b: any) =>
                    safeDate(getBookingDateKey(a)).getTime() -
                    safeDate(getBookingDateKey(b)).getTime(),
                )
                .map((booking: any) => {
                  const bookingId = String(booking.id);
                  const draftDate =
                    bookingDateDrafts[bookingId] || getBookingDateKey(booking);

                  return (
                    <View key={bookingId} style={styles.bookingManageDateCard}>
                      <View style={styles.bookingManageDateHeader}>
                        <View>
                          <Text style={styles.bookingManageDateTitle}>
                            {draftDate
                              ? formatAttendanceDate(draftDate)
                              : "No date selected"}
                          </Text>
                          <Text style={styles.bookingManageDateSubtext}>
                            Status: {booking.status || "confirmed"}
                          </Text>
                        </View>
                      </View>

                      {Platform.OS === "web" ? (
                        <input
                          type="date"
                          value={draftDate}
                          onChange={(event: any) => {
                            const nextValue = event?.target?.value || '';
                            setBookingDateDrafts((current) => ({
                              ...current,
                              [bookingId]: nextValue,
                            }));
                          }}
                          style={{
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid #D1D5DB",
                            fontSize: 15,
                            marginTop: 10,
                            marginBottom: 10,
                          }}
                        />
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={draftDate}
                          onChangeText={(text) =>
                            setBookingDateDrafts((current) => ({
                              ...current,
                              [bookingId]: text,
                            }))
                          }
                          placeholder="YYYY-MM-DD"
                        />
                      )}

                      <Text style={styles.bookingManageDateSubtext}>
                        Make-up class
                      </Text>

                      {Platform.OS === "web" ? (
                        <select
                          value={bookingClassDrafts[bookingId] || String(booking.classId || "")}
                          onChange={(event: any) => {
                            const nextClassId = event?.target?.value || "";
                            setBookingClassDrafts((current) => ({
                              ...current,
                              [bookingId]: nextClassId,
                            }));
                          }}
                          style={{
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid #D1D5DB",
                            fontSize: 15,
                            marginBottom: 10,
                          }}
                        >
                          <option value="">Choose class</option>
                          {adminClasses.map((cls: any) => (
                            <option key={cls.id} value={String(cls.id)}>
                              {cls.day} • {cls.time} • {cls.name || "Gymnastics Class"} {cls.age_group ? `- ${cls.age_group}` : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={bookingClassDrafts[bookingId] || String(booking.classId || "")}
                          onChangeText={(text) =>
                            setBookingClassDrafts((current) => ({
                              ...current,
                              [bookingId]: text,
                            }))
                          }
                          placeholder="Class ID"
                        />
                      )}

                      <View style={styles.bookingManageDateActions}>
                        <TouchableOpacity
                          style={[
                            styles.bookingManageActionButton,
                            styles.bookingManageSaveButton,
                          ]}
                          onPress={() => handleUpdateBookingDate(bookingId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.bookingManageActionText}>
                            Save Date
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.bookingManageActionButton,
                            styles.bookingManageCancelButton,
                          ]}
                          onPress={() => handleCancelBookingDate(bookingId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.bookingManageActionText}>
                            Cancel Date
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.bookingManageActionButton,
                            styles.bookingManageDeleteButton,
                          ]}
                          onPress={() => handleDeleteBookingDate(bookingId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.bookingManageActionText}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setEditingBooking(null)}
                >
                  <Text style={styles.buttonSecondaryText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showCreateUserModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Parent Account</Text>
              <TouchableOpacity onPress={() => setShowCreateUserModal(false)}>
                <X color={Colors.darkGray} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Parent First Name</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.parentFirstName}
                onChangeText={(text) =>
                  setCreateUserForm({
                    ...createUserForm,
                    parentFirstName: text,
                  })
                }
                placeholder="Example: Sherwin"
              />

              <Text style={styles.label}>Parent Family Name</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.parentLastName}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, parentLastName: text })
                }
                placeholder="Example: Wakim"
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.username}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, username: text })
                }
                autoCapitalize="none"
                placeholder="Example: sherwin_wakim"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.email}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, email: text })
                }
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="parent@email.com"
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.phoneNumber}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, phoneNumber: text })
                }
                keyboardType="phone-pad"
                placeholder="70123456 or +96170123456"
              />

              <Text style={styles.label}>Temporary Password</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.password}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, password: text })
                }
                secureTextEntry
                placeholder="Minimum 6 characters"
              />

              <Text style={styles.label}>Child First Name</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.childFirstName}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, childFirstName: text })
                }
                placeholder="Example: Geo"
              />

              <Text style={styles.label}>Child Age</Text>
              <TextInput
                style={styles.input}
                value={createUserForm.childAge}
                onChangeText={(text) =>
                  setCreateUserForm({ ...createUserForm, childAge: text })
                }
                keyboardType="number-pad"
                placeholder="Example: 7"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowCreateUserModal(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    createUserLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleCreateParentAccount}
                  disabled={createUserLoading}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {createUserLoading ? "Creating..." : "Create Account"}
                  </Text>
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

            <ScrollView
              style={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Parent Name</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, name: text })
                }
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={editForm.username}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, username: text })
                }
                autoCapitalize="none"
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editForm.phoneNumber}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, phoneNumber: text })
                }
                keyboardType="phone-pad"
              />

              {!!editForm.childId && (
                <>
                  <Text style={styles.label}>Child Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.childName}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, childName: text })
                    }
                  />

                  <Text style={styles.label}>Child Age</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.childAge}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, childAge: text })
                    }
                    keyboardType="number-pad"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setEditingUser(null)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveUser}
                >
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerLogoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerLogoutText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  smallActionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallActionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  container: {
    flex: 1,
    flexDirection: "row" as const,
  },
  sidebar: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  logoutTab: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  logoutTabText: {
    color: Colors.danger,
    fontWeight: "700" as const,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.darkGray,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  cardActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  resetPasswordButton: {
    backgroundColor: "#EAF4FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resetPasswordButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "900" as const,
  },
  iconButton: {
    padding: 8,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "bold" as const,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  announcementMessage: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
  },
  typePromotion: {
    backgroundColor: "#FFF3E0",
  },
  typeEvent: {
    backgroundColor: "#E8F5E9",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.darkGray,
    textTransform: "capitalize" as const,
  },
  galleryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  galleryThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#F1F4F8",
    marginRight: 12,
  },
  galleryTextWrap: {
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
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  uploadImageButtonDisabled: {
    opacity: 0.6,
  },
  uploadImageButtonText: {
    color: Colors.white,
    fontWeight: "bold" as const,
    marginLeft: 8,
  },
  galleryPreviewBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  galleryPreviewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F1F4F8",
  },
  galleryPreviewText: {
    marginTop: 8,
    color: Colors.mediumGray,
    fontSize: 13,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 15,
    fontWeight: "bold" as const,
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
    fontWeight: "bold" as const,
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
    fontWeight: "bold" as const,
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
    fontWeight: "bold" as const,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  userCountText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: "800" as const,
    marginTop: 4,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingClass: {
    fontSize: 14,
    fontWeight: "600" as const,
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
    fontWeight: "600" as const,
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
    fontWeight: "600" as const,
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
    fontWeight: "600" as const,
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
    borderColor: "transparent",
  },
  attendanceCardPresent: {
    backgroundColor: "#E8F5E9",
    borderColor: Colors.success,
  },
  attendanceInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  attendanceName: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.darkGray,
  },
  modal: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
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
    textAlignVertical: "top" as const,
  },
  typeButtons: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
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
    fontWeight: "600" as const,
    color: Colors.darkGray,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  buttonSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonSecondaryText: {
    color: Colors.darkGray,
    fontSize: 16,
    fontWeight: "600" as const,
  },

  bookingGroupCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingGroupHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  bookingScheduleLine: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  scheduleBox: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginTop: 12,
  },
  scheduleDateBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  scheduleDay: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  scheduleDate: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 2,
  },
  scheduleDateBoxCancelled: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  cancelledText: {
    color: "#991B1B",
  },
  bookingStatusText: {
    fontSize: 11,
    color: Colors.mediumGray,
    fontWeight: "700" as const,
    marginTop: 4,
  },
  bookingDateActions: {
    flexDirection: "row" as const,
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
    fontWeight: "800" as const,
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
    fontWeight: "800" as const,
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
    fontWeight: "700" as const,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  attendanceFilterRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    alignItems: "center" as const,
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
    fontWeight: "700" as const,
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
    fontWeight: "700" as const,
  },
  attendanceStepTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  attendanceStepSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 12,
  },
  attendanceDayGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  attendanceDayCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceDayTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  attendanceDayDate: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  attendanceDayCount: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
  attendanceClassGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceClassName: {
    fontSize: 15,
    fontWeight: "800" as const,
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
    alignSelf: "flex-start" as const,
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
    fontWeight: "700" as const,
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
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
    fontWeight: "700" as const,
    marginTop: 4,
  },
  attendanceActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  attendancePresentButton: {
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  attendanceButtonActive: {
    backgroundColor: "#10B981",
  },
  attendanceAbsentButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  attendanceAbsentButtonActive: {
    backgroundColor: "#EF4444",
  },
  attendanceButtonText: {
    color: "#065F46",
    fontWeight: "800" as const,
  },
  attendanceAbsentText: {
    color: "#991B1B",
    fontWeight: "800" as const,
  },
  attendanceButtonTextActive: {
    color: Colors.white,
  },
  makeupAddButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  makeupAddButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "800" as const,
  },
  makeupStudentCard: {
    borderWidth: 2,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },
  makeupNoteText: {
    fontSize: 12,
    color: "#065F46",
    marginTop: 2,
  },
  makeupContextText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: "700" as const,
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
    backgroundColor: "#E3F2FD",
  },
  makeupResultName: {
    fontSize: 14,
    fontWeight: "800" as const,
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
    fontWeight: "700" as const,
    marginTop: 12,
  },
  nativePickerBox: {
    marginTop: 12,
    alignItems: "flex-start" as const,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: "center" as const,
    paddingVertical: 32,
  },
  bookingManageModalContent: {
    maxWidth: 720,
  },
  bookingManageSubtitle: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  bookingManageInfoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  bookingManageInfoLabel: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  bookingManageInfoText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
    marginBottom: 6,
  },
  bookingManageDateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  bookingManageDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookingManageDateTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  bookingManageDateSubtext: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  bookingManageDateActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  bookingManageActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 96,
    alignItems: "center",
  },
  bookingManageSaveButton: {
    backgroundColor: Colors.primary,
  },
  bookingManageCancelButton: {
    backgroundColor: "#F59E0B",
  },
  bookingManageDeleteButton: {
    backgroundColor: Colors.danger,
  },
  bookingManageActionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
