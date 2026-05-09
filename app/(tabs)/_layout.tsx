import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/styles/colors";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        tabBarStyle: {
          backgroundColor: "rgba(13,13,13,0.97)",
          borderTopWidth: 1,
          borderTopColor: "rgba(29,185,84,0.15)",
          height: 64 + bottom,
          paddingBottom: 10 + bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.8,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "mic" : "mic-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transcribe"
        options={{
          title: "AI Assist",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "musical-notes" : "musical-notes-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
