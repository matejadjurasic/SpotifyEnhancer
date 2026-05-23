import { RecordButton } from "@/components/recording/RecordButton";
import { RecordingInstruction } from "@/components/recording/RecordingInstruction";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { SongConfirmModal } from "@/components/recording/SongConfirmModal";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { useRecording } from "@/hooks/useRecording";
import { useTimer } from "@/hooks/useTimer";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />
      <SafeAreaView style={commonStyles.screenSafeArea}>
        <ScreenHeader subtitle="READY TO RECORD" onLogout={logout} />

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
      </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
