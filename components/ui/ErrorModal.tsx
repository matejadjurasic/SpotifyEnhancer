import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ visible, message, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.messageRow}>
            <Ionicons name="close-circle" size={26} color={colors.danger} />
            <Text style={styles.messageText}>{message}</Text>
          </View>
          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  card: {
    width: "88%",
    maxWidth: 420,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: "500",
  },
  okButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  okText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
