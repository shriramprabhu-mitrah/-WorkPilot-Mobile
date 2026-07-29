import React, { useEffect } from 'react';
import Animated, {useAnimatedStyle,useSharedValue,withDelay,withTiming,Easing} from 'react-native-reanimated';
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