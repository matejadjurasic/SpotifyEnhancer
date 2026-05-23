import { colors } from "@/styles/colors";
import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

interface OrbConfig {
  color: string;
  size: number;
  left: number;
  top: number;
  xRange: number;
  yRange: number;
  duration: number;
  delay: number;
}

const ORBS: OrbConfig[] = [
  {
    color: colors.orbGreenPrimary,
    size: 360,
    left: SW * 0.88,
    top: SH * 0.1,
    xRange: 30,
    yRange: 24,
    duration: 7200,
    delay: 0,
  },
  {
    color: colors.orbPurple,
    size: 290,
    left: SW * 0.07,
    top: SH * 0.25,
    xRange: 22,
    yRange: 32,
    duration: 9500,
    delay: 1100,
  },
  {
    color: colors.orbBlue,
    size: 330,
    left: SW * 0.14,
    top: SH * 0.7,
    xRange: 26,
    yRange: 20,
    duration: 11000,
    delay: 550,
  },
  {
    color: colors.orbGreenSecondary,
    size: 210,
    left: SW * 0.8,
    top: SH * 0.62,
    xRange: 18,
    yRange: 28,
    duration: 8600,
    delay: 1900,
  },
];

const AnimatedOrb: React.FC<OrbConfig> = ({
  color,
  size,
  left,
  top,
  xRange,
  yRange,
  duration,
  delay,
}) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sc = useSharedValue(1);

  useEffect(() => {
    tx.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(xRange, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(-xRange * 0.6, {
            duration: duration * 0.85,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: duration * 0.65,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
    ty.value = withDelay(
      delay + 450,
      withRepeat(
        withSequence(
          withTiming(-yRange, {
            duration: duration * 0.9,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(yRange * 0.65, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: duration * 0.75,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
    sc.value = withDelay(
      delay + 900,
      withRepeat(
        withSequence(
          withTiming(1.13, {
            duration: duration * 1.1,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.9, {
            duration: duration * 0.9,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: duration * 0.75,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: sc.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: left - size / 2,
          top: top - size / 2,
        },
        animStyle,
      ]}
    />
  );
};

export const ScreenBackground: React.FC = () => (
  <>
    {ORBS.map((orb, i) => (
      <AnimatedOrb key={i} {...orb} />
    ))}
  </>
);
