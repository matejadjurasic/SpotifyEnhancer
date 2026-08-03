import { SCREEN_HEADER_STRINGS } from "@/constants/strings";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  subtitle: string;
  onLogout: () => void;
  onProfile?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  subtitle,
  onLogout,
  onProfile,
}) => (
  <View style={styles.header}>
    <View style={styles.left}>
      <View style={styles.logoMark}>
        <Ionicons name="musical-notes" size={20} color={colors.text} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{SCREEN_HEADER_STRINGS.title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.actions}>
      {onProfile && (
        <TouchableOpacity
          onPress={onProfile}
          accessibilityLabel="Profile"
          accessibilityRole="button"
          style={styles.profileButton}
        >
          <Ionicons name="person" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onLogout}
        accessibilityLabel={SCREEN_HEADER_STRINGS.logoutLabel}
        accessibilityRole="button"
      >
        <Text style={styles.logoutText}>
          {SCREEN_HEADER_STRINGS.logoutLabel}
        </Text>
      </TouchableOpacity>
    </View>
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
