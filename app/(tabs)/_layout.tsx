import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors } from "@/styles/colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.background,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transcribe"
        options={{
          title: "Transcribe",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="mic.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
