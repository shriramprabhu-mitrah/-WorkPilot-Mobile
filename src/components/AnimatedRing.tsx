// import React, { useEffect } from "react";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withDelay,
//   withTiming,
//   Easing,
// } from "react-native-reanimated";

// interface AnimatedRingProps {
//   size: number;
//   borderWidth?: number;
//   borderColor?: string;
//   backgroundColor?: string;
//   delay?: number;
// }

// const AnimatedRing = ({
//   size,
//   borderWidth = 1,
//   borderColor = "rgba(255,255,255,0.08)",
//   backgroundColor = "transparent",
//   delay = 0,
// }: AnimatedRingProps) => {
//   const opacity = useSharedValue(0);
//   const scale = useSharedValue(0.75);

//   useEffect(() => {
//     opacity.value = withDelay(
//       delay,
//       withTiming(1, {
//         duration: 900,
//         easing: Easing.out(Easing.exp),
//       })
//     );

//     scale.value = withDelay(
//       delay,
//       withTiming(1, {
//         duration: 900,
//         easing: Easing.out(Easing.exp),
//       })
//     );
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       opacity: opacity.value,
//       transform: [{ scale: scale.value }],
//     };
//   });

//   return (
//     <Animated.View
//       style={[
//         {
//           position: "absolute",
//           width: size,
//           height: size,
//           borderRadius: size / 2,
//           borderWidth,
//           borderColor,
//           backgroundColor,
//         },
//         animatedStyle,
//       ]}
//     />
//   );
// };

// export default AnimatedRing;

import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';

interface Props {
  size: number;
  delay?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
}

const AnimatedRing = ({
  size,
  delay = 0,
  borderWidth = 1,
  borderColor,
  backgroundColor = 'transparent',
}: Props) => {
  const { colors } = useTheme();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.75);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.exp),
      }),
    );

    scale.value = withDelay(
      delay,
      withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.exp),
      }),
    );
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor:
            borderColor ?? colors.border,
          backgroundColor,
        },
        animatedStyle,
      ]}
    />
  );
};

export default AnimatedRing;