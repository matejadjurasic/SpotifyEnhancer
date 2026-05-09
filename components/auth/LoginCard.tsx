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
      {/* Logo mark */}
      <View style={styles.logoWrap}>
        <View style={styles.logoMark}>
          <Ionicons name="musical-notes" size={36} color="#fff" />
        </View>
      </View>

      {/* Wordmark */}
      <Text style={styles.title}>Spotify AI</Text>
      <Text style={styles.subtitle}>VOICE ASSISTANT</Text>

      {/* Description */}
      <Text style={styles.description}>
        Connect your Spotify account to unlock AI-powered music control with
        your voice.
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* CTA button */}
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onLogin}
        disabled={disabled}
        accessibilityLabel="Connect with Spotify"
        accessibilityRole="button"
      >
        <Ionicons
          name="logo-google-playstore"
          size={18}
          color="#000"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>Continue with Spotify</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        By continuing you agree to Spotify's Terms of Service.
      </Text>
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

  // Logo
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

  // Wordmark
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

  // Description
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 32,
    paddingHorizontal: 12,
  },

  // Divider
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(29,185,84,0.18)",
    marginBottom: 32,
  },

  // Button
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
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Legal
  legal: {
    marginTop: 20,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.5,
    letterSpacing: 0.2,
  },
});
