import { LOGIN_CARD_STRINGS } from "@/constants/strings";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LoginCardProps {
  onLogin: () => void;
  disabled: boolean;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin, disabled }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logoMark}>
          <Ionicons
            name="musical-notes"
            size={36}
            color={colors.loginCardIcon}
          />
        </View>
      </View>
      <Text style={styles.title}>{LOGIN_CARD_STRINGS.title}</Text>
      <Text style={styles.subtitle}>{LOGIN_CARD_STRINGS.subtitle}</Text>
      <Text style={styles.description}>{LOGIN_CARD_STRINGS.description}</Text>
      <View style={styles.divider} />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onLogin}
        disabled={disabled}
        accessibilityLabel={LOGIN_CARD_STRINGS.buttonAccessibilityLabel}
        accessibilityRole="button"
      >
        <Ionicons
          name="logo-google-playstore"
          size={18}
          color={colors.loginCardButtonText}
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>{LOGIN_CARD_STRINGS.buttonLabel}</Text>
      </TouchableOpacity>
      <Text style={styles.legal}>{LOGIN_CARD_STRINGS.legal}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
  },
  logoWrap: {
    marginBottom: 28,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 14,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 2.5,
    fontWeight: "600",
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.loginCardDivider,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    width: "100%",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: colors.loginCardButtonText,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  legal: {
    marginTop: 20,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.5,
    letterSpacing: 0.2,
  },
});
