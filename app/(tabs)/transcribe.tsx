import { RecordButton } from "@/components/recording/RecordButton";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { N8N_TRANSCRIBE_WEBHOOK_URL } from "@/config/constants";
import { useAuth } from "@/context/AuthContext";
import { useDeepgramTranscription } from "@/hooks/useDeepgramTranscription";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Audio visualizer bar ─────────────────────────────────────────────────────

const BAR_CONFIGS = [
  { delay: 0, peak: 30, dur: 280 },
  { delay: 80, peak: 44, dur: 360 },
  { delay: 40, peak: 24, dur: 220 },
  { delay: 130, peak: 38, dur: 305 },
  { delay: 20, peak: 50, dur: 400 },
  { delay: 110, peak: 22, dur: 245 },
  { delay: 60, peak: 42, dur: 340 },
];

const AudioBar: React.FC<{
  peak: number;
  dur: number;
  delay: number;
  isActive: boolean;
}> = ({ peak, dur, delay, isActive }) => {
  const h = useSharedValue(4);

  useEffect(() => {
    if (isActive) {
      h.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(peak, {
              duration: dur,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(4, {
              duration: dur * 0.8,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          false,
        ),
      );
    } else {
      cancelAnimation(h);
      h.value = withTiming(4, { duration: 350 });
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({ height: h.value }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 2,
          backgroundColor: colors.primary,
          marginHorizontal: 3,
          alignSelf: "center",
        },
        style,
      ]}
    />
  );
};

// ─── Loading dot ──────────────────────────────────────────────────────────────

const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 380 }),
          withTiming(0.8, { duration: 380 }),
        ),
        -1,
        false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 380 }),
          withTiming(0.2, { duration: 380 }),
        ),
        -1,
        false,
      );
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.primary,
          marginHorizontal: 4,
        },
        style,
      ]}
    />
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TranscribeScreen() {
  const { spotifyToken, logout } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
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
    } finally {
      setIsSending(false);
    }
  };

  const statusText = isSending
    ? "AI is thinking…"
    : isRecording
      ? "Listening to you…"
      : "Tap to speak with AI";

  return (
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />

      <SafeAreaView style={commonStyles.screenSafeArea}>
        <ScreenHeader subtitle="VOICE ASSISTANT" onLogout={logout} />

        {/* ── Transcript card ── */}
        <View style={styles.transcriptCard}>
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
                    ? "Speak now…"
                    : "Your transcription will appear here"}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Audio waveform visualizer */}
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

        {/* ── Status row ── */}
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

        {/* ── Record button ── */}
        <View style={styles.buttonWrap}>
          <RecordButton
            isRecording={isRecording}
            isUploading={false}
            isSending={isSending}
            onPress={handlePress}
            disabled={false}
          />
        </View>

        {/* ── Hint ── */}
        {!isSending && (isRecording || finalTranscript) ? (
          <Text style={styles.hint}>
            {isRecording
              ? "Tap to stop & send to assistant"
              : "Starting again will clear the transcript"}
          </Text>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Transcript card
  transcriptCard: {
    backgroundColor: "rgba(28,28,28,0.88)",
    borderRadius: 22,
    width: "100%",
    flex: 1,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.20)",
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

  // Audio visualizer
  visualizer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginTop: 12,
  },

  // Status
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
    color: "#E91E63",
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Button
  buttonWrap: {
    marginBottom: 20,
  },

  // Hint
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.6,
    letterSpacing: 0.2,
  },
});
