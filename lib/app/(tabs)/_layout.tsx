import { Stack } from "expo-router";
import React from "react";
import Sidebar from "@/components/Sidebar";

export default function TabLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="coaches" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="profile" />
      </Stack>
      <Sidebar />
    </>
  );
}
