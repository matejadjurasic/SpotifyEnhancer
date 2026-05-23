import { PulseRing } from "@/components/recording/PulseRing";
import { SpinnerArc } from "@/components/recording/SpinnerArc";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
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

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isUploading,
  isSending = false,
  onPress,
  disabled,
}) => {
  const isLoading = isSending || isUploading;
  const borderColor = isLoading
    ? colors.recordButtonLoadingAccent
    : isRecording
      ? colors.statusRecording
      : colors.primary;
  const glowColor = isLoading
    ? colors.recordButtonLoadingAccent
    : isRecording
      ? colors.statusRecording
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
      <PulseRing
        delay={0}
        isActive={isRecording && !isLoading}
        color={colors.statusRecording}
        size={BUTTON_SIZE}
      />
      <PulseRing
        delay={567}
        isActive={isRecording && !isLoading}
        color={colors.statusRecording}
        size={BUTTON_SIZE}
      />
      <PulseRing
        delay={1134}
        isActive={isRecording && !isLoading}
        color={colors.statusRecording}
        size={BUTTON_SIZE}
      />
      {isLoading && <SpinnerArc size={BUTTON_SIZE} />}
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
              /* AI thinking state – musical notes (dimmed) */
              <Ionicons
                name="musical-notes"
                size={40}
                color={colors.recordButtonLoadingIcon}
              />
            ) : isRecording ? (
              /* Stop icon in accent pink */
              <Ionicons
                name="stop-circle"
                size={52}
                color={colors.statusRecording}
              />
            ) : (
              /* Idle – mic with green accent dot */
              <View style={styles.micWrap}>
                <Ionicons name="mic" size={46} color={colors.text} />
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
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.recordButtonBackground,
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
    backgroundColor: colors.recordButtonInnerIdle,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInnerRecording: {
    backgroundColor: colors.recordButtonInnerRecording,
  },
  buttonInnerLoading: {
    backgroundColor: colors.recordButtonInnerLoading,
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
    borderColor: colors.recordButtonBackground,
  },
});
