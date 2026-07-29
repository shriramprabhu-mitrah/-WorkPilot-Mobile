import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {Easing,useAnimatedStyle,useSharedValue,withDelay,withRepeat,withSequence,withTiming} from 'react-native-reanimated';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../hooks/useTheme';
interface DotProps {
  delay: number;
  color: string;
  size: number;
  spacing: number;
  bounceHeight: number;
}

const Dot = ({delay,color,size,spacing,bounceHeight}: DotProps) => {

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(
            -bounceHeight,
            {
              duration:300,
              easing:Easing.out(Easing.ease),
            }),
          withTiming(0,
            {
              duration:300,
              easing:Easing.in(Easing.ease),
            })),
        -1,false));
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1,{duration:300}),
          withTiming(0.5,{duration:300}
          )),
        -1,
        false
      ));
  }, [
    delay,
    bounceHeight,
    opacity,
    translateY
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform:[{translateY:translateY.value}],
    opacity:opacity.value,
  }));

  return (
    <Animated.View
      style={[{
          width:size,
          height:size,
          borderRadius:size/2,
          backgroundColor:color,
          marginHorizontal:spacing,
        },
        animatedStyle
      ]} />
    );};
interface LoadingDotsProps {
  color?:string;
  size?:number;
  spacing?:number;
}

const LoadingDots = ({color,size,spacing}: LoadingDotsProps) => {
  const { colors } = useTheme();
  const { moderateScale } = useResponsive();
  const dotSize = size ?? moderateScale(8);
  const dotSpacing = spacing ?? moderateScale(4);
  const bounceHeight = moderateScale(8);

  return (
    <View className="flex-row items-center justify-center">
      <Dot
        delay={0}
        color={color ?? colors.white}
        size={dotSize}
        spacing={dotSpacing}
        bounceHeight={bounceHeight}
      />
      <Dot
        delay={200}
        color={color ?? colors.white}
        size={dotSize}
        spacing={dotSpacing}
        bounceHeight={bounceHeight}
      />
      <Dot
        delay={400}
        color={color ?? colors.white}
        size={dotSize}
        spacing={dotSpacing}
        bounceHeight={bounceHeight}
      />
    </View>
  );
};

export default LoadingDots;