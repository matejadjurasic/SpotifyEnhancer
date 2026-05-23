import { AudioBar } from "@/components/recording/AudioBar";
import { TRANSCRIBE_STRINGS } from "@/constants/strings";
import { BAR_CONFIGS } from "@/constants/visualizer";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface TranscriptCardProps {
  finalTranscript: string;
  interimTranscript: string;
  isRecording: boolean;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  finalTranscript,
  interimTranscript,
  isRecording,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.placeholderWrap}>
            <Ionicons
              name="mic-outline"
              size={32}
              color={colors.textSecondary}
              style={{ marginBottom: 10, opacity: 0.6 }}
            />
            <Text style={styles.placeholderText}>
              {isRecording
                ? TRANSCRIBE_STRINGS.placeholderRecording
                : TRANSCRIBE_STRINGS.placeholderIdle}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.visualizer}>
        {BAR_CONFIGS.map((b, i) => (
          <AudioBar
            key={i}
            peak={b.peak}
            dur={b.dur}
            delay={b.delay}
            isActive={isRecording}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.transcriptCardBackground,
    borderRadius: 22,
    width: "100%",
    flex: 1,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.transcriptCardBorder,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    opacity: 0.6,
  },
  finalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 27,
  },
  interimText: {
    fontSize: 16,
    color: colors.primary,
    lineHeight: 27,
    fontStyle: "italic",
    opacity: 0.85,
  },
  visualizer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginTop: 12,
  },
});
