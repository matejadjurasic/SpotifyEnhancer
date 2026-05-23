import { LoadingDot } from "@/components/ui/LoadingDot";
import { TRANSCRIBE_STRINGS } from "@/constants/strings";
import { colors } from "@/styles/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusRowProps {
  isSending: boolean;
  isRecording: boolean;
}

export const StatusRow: React.FC<StatusRowProps> = ({
  isSending,
  isRecording,
}) => {
  const statusText = isSending
    ? TRANSCRIBE_STRINGS.statusSending
    : isRecording
      ? TRANSCRIBE_STRINGS.statusListening
      : TRANSCRIBE_STRINGS.statusIdle;

  return (
    <View style={styles.statusRow}>
      <Text
        style={[
          styles.statusText,
          isSending && styles.statusTextSending,
          isRecording && styles.statusTextRecording,
        ]}
      >
        {statusText}
      </Text>
      {isSending && (
        <View style={styles.dotsRow}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusRow: {
    alignItems: "center",
    marginBottom: 20,
    minHeight: 46,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.4,
    fontWeight: "500",
  },
  statusTextSending: {
    color: colors.primary,
    fontWeight: "700",
  },
  statusTextRecording: {
    color: colors.statusRecording,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
