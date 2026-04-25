import { Stack } from "expo-router";
import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Menu } from "lucide-react-native";
import { useSidebar } from "@/contexts/SidebarContext";

export default function HomeLayout() {
  const { toggleSidebar } = useSidebar();

  const MenuButton = useCallback(() => {
    const handlePress = () => {
      console.log('Menu button pressed in HomeLayout');
      toggleSidebar();
    };

    return (
      <TouchableOpacity onPress={handlePress} style={{ marginLeft: 16 }}>
        <Menu color="#ffffff" size={24} />
      </TouchableOpacity>
    );
  }, [toggleSidebar]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Gymnest",
          headerStyle: { backgroundColor: '#1a2b4a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' as const, fontSize: 20 },
          headerLeft: MenuButton,
        }} 
      />
      <Stack.Screen 
        name="events" 
        options={{ 
          title: "Events & News",
          headerStyle: { backgroundColor: '#1a2b4a' },
          headerTintColor: '#ffffff',
        }} 
      />
      <Stack.Screen 
        name="gallery" 
        options={{ 
          title: "Gallery",
          headerStyle: { backgroundColor: '#1a2b4a' },
          headerTintColor: '#ffffff',
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: "Contact Us",
          headerStyle: { backgroundColor: '#1a2b4a' },
          headerTintColor: '#ffffff',
        }} 
      />
    </Stack>
  );
}
