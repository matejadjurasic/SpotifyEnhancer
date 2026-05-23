import { colors } from "@/styles/colors";
import React, { useEffect } from "react";
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface LoadingDotProps {
  delay: number;
}

export const LoadingDot: React.FC<LoadingDotProps> = ({ delay }) => {
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
