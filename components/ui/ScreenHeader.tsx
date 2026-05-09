import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  subtitle: string;
  onLogout: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  subtitle,
  onLogout,
}) => (
  <View style={styles.header}>
    <View style={styles.left}>
      <View style={styles.logoMark}>
        <Ionicons name="musical-notes" size={20} color="#fff" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Spotify AI</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={onLogout}
      accessibilityLabel="Logout"
      accessibilityRole="button"
    >
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 28,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  textCol: {
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  logoutText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
