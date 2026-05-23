import { colors } from "@/styles/colors";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface SpinnerArcProps {
  size: number;
}

export const SpinnerArc: React.FC<SpinnerArcProps> = ({ size }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const outerSize = size + 22;
  const outerRadius = outerSize / 2;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: outerSize,
          height: outerSize,
          borderRadius: outerRadius,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.arc,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerRadius,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  arc: {
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: colors.primary,
    borderRightColor: colors.primaryFaded,
    position: "absolute",
  },
});
