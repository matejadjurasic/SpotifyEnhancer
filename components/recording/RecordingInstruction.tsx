import { colors } from "@/styles/colors";
import React from "react";
import { StyleSheet, Text } from "react-native";

interface RecordingInstructionProps {
  isRecording: boolean;
  isUploading: boolean;
}

export const RecordingInstruction: React.FC<RecordingInstructionProps> = ({
  isRecording,
  isUploading,
}) => {
  const getText = (): string => {
    if (isUploading) return "Processing...";
    if (isRecording) return "Recording... Tap to stop";
    return "Tap to record audio (max 30s)";
  };

  return <Text style={styles.instruction}>{getText()}</Text>;
};

const styles = StyleSheet.create({
  instruction: {
    marginTop: 40,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
