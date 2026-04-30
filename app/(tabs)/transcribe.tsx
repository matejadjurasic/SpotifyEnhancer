import { RecordButton } from "@/components/recording/RecordButton";
import { N8N_TRANSCRIBE_WEBHOOK_URL } from "@/config/constants";
import { useAuth } from "@/context/AuthContext";
import { useDeepgramTranscription } from "@/hooks/useDeepgramTranscription";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import React, { useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TranscribeScreen() {
  const { spotifyToken } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
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
    try {
      const response = await fetch(N8N_TRANSCRIBE_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, spotify_token: spotifyToken }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to send transcript: ${(error as Error).message}`,
      );
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Transcribe</Text>
      </View>

      <View style={styles.transcriptCard}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {finalTranscript || interimTranscript ? (
            <Text style={styles.finalText}>
              {finalTranscript}
              {finalTranscript && interimTranscript ? " " : ""}
              {interimTranscript ? (
                <Text style={styles.interimText}>{interimTranscript}</Text>
              ) : null}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              {isRecording
                ? "Listening..."
                : "Tap record to start transcribing"}
            </Text>
          )}
        </ScrollView>
      </View>

      <RecordButton
        isRecording={isRecording}
        isUploading={false}
        onPress={handlePress}
        disabled={false}
      />

      {isRecording || finalTranscript ? (
        <Text style={styles.hint}>
          {isRecording
            ? "Tap to stop & send to assistant"
            : "Starting again will clear the transcript"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: "90%",
    height: 220,
    marginBottom: 40,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  finalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  interimText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  hint: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
