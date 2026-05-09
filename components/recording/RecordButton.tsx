import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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

export interface RecordButtonProps {
  isRecording: boolean;
  isUploading: boolean;
  isSending?: boolean;
  onPress: () => void;
  disabled: boolean;
}

const BUTTON_SIZE = 128;
const RECORD_COLOR = "#E91E63";

// ─── Pulse ring ───────────────────────────────────────────────────────────────

const PulseRing: React.FC<{
  delay: number;
  isActive: boolean;
  color: string;
}> = ({ delay, isActive, color }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withDelay(
        delay,
        withRepeat(
          withTiming(2.9, { duration: 1700, easing: Easing.out(Easing.ease) }),
          -1,
          false,
        ),
      );
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.55, { duration: 80 }),
            withTiming(0, { duration: 1620, easing: Easing.out(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />;
};

// ─── Spinner arc ──────────────────────────────────────────────────────────────

const SpinnerArc: React.FC = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinnerWrap, style]}>
      <View style={styles.spinnerArc} />
    </Animated.View>
  );
};

// ─── Main button ──────────────────────────────────────────────────────────────

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isUploading,
  isSending = false,
  onPress,
  disabled,
}) => {
  const isLoading = isSending || isUploading;
  const borderColor = isLoading
    ? "#333"
    : isRecording
      ? RECORD_COLOR
      : colors.primary;
  const glowColor = isLoading
    ? "#333"
    : isRecording
      ? RECORD_COLOR
      : colors.primary;

  const breathe = useSharedValue(1);
  useEffect(() => {
    if (isLoading) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(0.96, {
            duration: 950,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, { duration: 950, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(breathe);
      breathe.value = withTiming(1, { duration: 300 });
    }
  }, [isLoading]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Ripple rings – recording */}
      <PulseRing
        delay={0}
        isActive={isRecording && !isLoading}
        color={colors.primary}
      />
      <PulseRing
        delay={567}
        isActive={isRecording && !isLoading}
        color={colors.primary}
      />
      <PulseRing
        delay={1134}
        isActive={isRecording && !isLoading}
        color={colors.primary}
      />

      {/* Spinning arc – loading / sending */}
      {isLoading && <SpinnerArc />}

      <Animated.View style={breatheStyle}>
        <TouchableOpacity
          style={[styles.button, { borderColor, shadowColor: glowColor }]}
          onPress={onPress}
          disabled={disabled || isLoading}
          activeOpacity={0.82}
        >
          <View
            style={[
              styles.buttonInner,
              isRecording && !isLoading && styles.buttonInnerRecording,
              isLoading && styles.buttonInnerLoading,
            ]}
          >
            {isLoading ? (
              /* AI thinking state – musical notes in Spotify green (dimmed) */
              <Ionicons name="musical-notes" size={40} color="#444" />
            ) : isRecording ? (
              /* Stop icon in accent pink */
              <Ionicons name="stop-circle" size={52} color={RECORD_COLOR} />
            ) : (
              /* Idle – mic with green accent dot */
              <View style={styles.micWrap}>
                <Ionicons name="mic" size={46} color="#fff" />
                <View style={styles.greenDot} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
  },
  spinnerWrap: {
    position: "absolute",
    width: BUTTON_SIZE + 22,
    height: BUTTON_SIZE + 22,
    borderRadius: (BUTTON_SIZE + 22) / 2,
  },
  spinnerArc: {
    width: BUTTON_SIZE + 22,
    height: BUTTON_SIZE + 22,
    borderRadius: (BUTTON_SIZE + 22) / 2,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: colors.primary,
    borderRightColor: `${colors.primary}70`,
    position: "absolute",
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#0D1117",
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 14,
  },
  buttonInner: {
    width: BUTTON_SIZE - 16,
    height: BUTTON_SIZE - 16,
    borderRadius: (BUTTON_SIZE - 16) / 2,
    backgroundColor: "rgba(29,185,84,0.09)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInnerRecording: {
    backgroundColor: "rgba(233,30,99,0.10)",
  },
  buttonInnerLoading: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  micWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  greenDot: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "#0D1117",
  },
});
