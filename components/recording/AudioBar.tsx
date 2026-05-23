import { colors } from "@/styles/colors";
import React, { useEffect } from "react";
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

interface AudioBarProps {
  peak: number;
  dur: number;
  delay: number;
  isActive: boolean;
}

export const AudioBar: React.FC<AudioBarProps> = ({
  peak,
  dur,
  delay,
  isActive,
}) => {
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
