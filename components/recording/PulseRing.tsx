import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
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

interface PulseRingProps {
  delay: number;
  isActive: boolean;
  color: string;
  size: number;
}

export const PulseRing: React.FC<PulseRingProps> = ({
  delay,
  isActive,
  color,
  size,
}) => {
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor: color,
  };

  return <Animated.View style={[styles.ring, ringStyle, animatedStyle]} />;
};

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
});
