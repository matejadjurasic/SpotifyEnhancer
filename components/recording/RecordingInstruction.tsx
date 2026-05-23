import { RECORDING_INSTRUCTION_STRINGS } from "@/constants/strings";
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
    if (isUploading) return RECORDING_INSTRUCTION_STRINGS.uploading;
    if (isRecording) return RECORDING_INSTRUCTION_STRINGS.recording;
    return RECORDING_INSTRUCTION_STRINGS.idle;
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
