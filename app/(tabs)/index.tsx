import { RecordButton } from "@/components/recording/RecordButton";
import { RecordingInstruction } from "@/components/recording/RecordingInstruction";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { SongConfirmModal } from "@/components/recording/SongConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { useRecording } from "@/hooks/useRecording";
import { useTimer } from "@/hooks/useTimer";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RecordingScreen() {
  const { spotifyToken, logout } = useAuth();
  const {
    isRecording,
    isUploading,
    startRecording,
    stopRecording,
    result,
    showConfirm,
    setShowConfirm,
  } = useRecording(spotifyToken);
  const seconds = useTimer(isRecording, stopRecording);

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ready to Record</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <RecordingTimer seconds={seconds} />

        <RecordButton
          isRecording={isRecording}
          isUploading={isUploading}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isUploading}
        />

        <RecordingInstruction
          isRecording={isRecording}
          isUploading={isUploading}
        />
      </View>
      {result && (
        <SongConfirmModal
          visible={showConfirm}
          data={result}
          onConfirm={() => {
            setShowConfirm(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 16,
  },
  content: {
    alignItems: "center",
  },
});
