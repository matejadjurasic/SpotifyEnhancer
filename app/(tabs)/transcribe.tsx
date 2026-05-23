import { RecordButton } from "@/components/recording/RecordButton";
import { TranscriptCard } from "@/components/recording/TranscriptCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusRow } from "@/components/ui/StatusRow";
import { TRANSCRIBE_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { useDeepgramTranscription } from "@/hooks/useDeepgramTranscription";
import { uploadService } from "@/services/uploadService";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TranscribeScreen() {
  const { spotifyToken, logout } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const {
    isRecording,
    finalTranscript,
    interimTranscript,
    startTranscription,
    stopTranscription,
    clearTranscript,
  } = useDeepgramTranscription();

  const handlePress = async () => {
    if (isRecording) {
      const transcript = await stopTranscription();
      if (transcript) {
        await sendToN8n(transcript);
      }
    } else {
      clearTranscript();
      await startTranscription();
    }
  };

  const sendToN8n = async (text: string) => {
    setIsSending(true);
    try {
      await uploadService.sendTranscript(text, spotifyToken!);
    } catch (error) {
      Alert.alert(
        TRANSCRIBE_STRINGS.errorTitle,
        `${TRANSCRIBE_STRINGS.errorSendPrefix}${(error as Error).message}`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />
      <SafeAreaView style={commonStyles.screenSafeArea}>
        <ScreenHeader
          subtitle={TRANSCRIBE_STRINGS.screenSubtitle}
          onLogout={logout}
        />
        <TranscriptCard
          finalTranscript={finalTranscript}
          interimTranscript={interimTranscript}
          isRecording={isRecording}
        />
        <StatusRow isSending={isSending} isRecording={isRecording} />
        <View style={styles.buttonWrap}>
          <RecordButton
            isRecording={isRecording}
            isUploading={false}
            isSending={isSending}
            onPress={handlePress}
            disabled={false}
          />
        </View>
        {!isSending && (isRecording || finalTranscript) ? (
          <Text style={styles.hint}>
            {isRecording
              ? TRANSCRIBE_STRINGS.hintRecording
              : TRANSCRIBE_STRINGS.hintIdle}
          </Text>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.6,
    letterSpacing: 0.2,
  },
});
