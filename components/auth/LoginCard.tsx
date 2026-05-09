import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LoginCardProps {
  onLogin: () => void;
  disabled: boolean;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin, disabled }) => {
  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.title}>🎵 Spotify Plus</Text>
      <Text style={commonStyles.subtitle}>
        Connect with Spotify to continue
      </Text>

      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onLogin}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>Connect Spotify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
});
