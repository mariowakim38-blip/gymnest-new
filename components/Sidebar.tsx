import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Calendar, Users, User, Trophy, X, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_WIDTH = 280;

interface NavItem {
  id: string;
  title: string;
  icon: typeof Home;
  route: string;
  matchPaths: string[];
}

const navItems: NavItem[] = [
  { id: 'home', title: 'Home', icon: Home, route: '/', matchPaths: ['/', '/events', '/gallery', '/contact'] },
  { id: 'classes', title: 'Classes', icon: Calendar, route: '/classes', matchPaths: ['/classes'] },
  { id: 'coaches', title: 'Coaches', icon: Users, route: '/coaches', matchPaths: ['/coaches'] },
  { id: 'progress', title: 'Progress', icon: Trophy, route: '/progress', matchPaths: ['/progress'] },
  { id: 'profile', title: 'Profile', icon: User, route: '/profile', matchPaths: ['/profile'] },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  console.log('Sidebar render - isOpen:', isOpen, 'pathname:', pathname);

  useEffect(() => {
    console.log('Sidebar animation effect - isOpen:', isOpen);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, slideAnim, overlayOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(Math.max(gestureState.dx, -SIDEBAR_WIDTH));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeSidebar();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNavigation = (route: string) => {
    closeSidebar();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const isActiveRoute = (item: NavItem) => {
    return item.matchPaths.some(path => {
      if (path === '/') {
        return pathname === '/' || pathname === '/(tabs)/(home)' || pathname === '/(tabs)/(home)/';
      }
      return pathname.includes(path);
    });
  };

  if (!isOpen && Platform.OS === 'web') {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            pointerEvents: isOpen ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={closeSidebar}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gymnest</Text>
          <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
            <X color={Colors.white} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.navItems}>
          {navItems.map((item) => {
            const isActive = isActiveRoute(item);
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.7}
              >
                <Icon
                  color={isActive ? Colors.white : Colors.lightGray}
                  size={24}
                />
                <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}

          {user?.role === 'admin' && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={[styles.navItem, pathname.includes('/admin') && styles.navItemActive]}
                onPress={() => handleNavigation('/admin')}
                activeOpacity={0.7}
              >
                <Shield
                  color={pathname.includes('/admin') ? Colors.white : Colors.lightGray}
                  size={24}
                />
                <Text style={[styles.navItemText, pathname.includes('/admin') && styles.navItemTextActive]}>
                  Admin Panel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.primary,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  closeButton: {
    padding: 4,
  },
  navItems: {
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.white,
  },
  navItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightGray,
  },
  navItemTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
    marginHorizontal: 20,
  },
});
