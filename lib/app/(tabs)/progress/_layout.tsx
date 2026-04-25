import { Stack } from "expo-router";
import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Menu } from "lucide-react-native";
import { useSidebar } from "@/contexts/SidebarContext";

export default function ProgressLayout() {
  const { toggleSidebar } = useSidebar();

  const MenuButton = useCallback(() => {
    const handlePress = () => {
      console.log('Menu button pressed in ProgressLayout');
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
          title: "Student Progress",
          headerStyle: { backgroundColor: '#1a2b4a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' as const, fontSize: 20 },
          headerLeft: MenuButton,
        }} 
      />
    </Stack>
  );
}
