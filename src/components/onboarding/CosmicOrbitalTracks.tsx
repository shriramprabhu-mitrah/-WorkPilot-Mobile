import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useSharedValue,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

const SparkleStar = ({
  cx,
  cy,
  r = 2.2,
  opacity = 0.5,
}: {
  cx: number;
  cy: number;
  r?: number;
  opacity?: number;
}) => <Circle cx={cx} cy={cy} r={r} fill='#FFFFFF' opacity={opacity} />;

const FourPointStar = ({
  x,
  y,
  size = 14,
  opacity = 0.55,
}: {
  x: number;
  y: number;
  size?: number;
  opacity?: number;
}) => (
  <Path
    d={`M ${x} ${y - size} Q ${x} ${y} ${x + size} ${y} Q ${x} ${y} ${x} ${y + size} Q ${x} ${y} ${x - size} ${y} Q ${x} ${y} ${x} ${y - size} Z`}
    fill='#FFFFFF'
    opacity={opacity}
  />
);

interface CosmicRingsProps {
  buttonRotation: SharedValue<number>;
}

const CosmicOrbitalTracks = ({ buttonRotation }: CosmicRingsProps) => {
  const continuousRotation = useSharedValue(0);

  useEffect(() => {
    continuousRotation.value = withRepeat(
      withTiming(360, { duration: 24000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [continuousRotation]);

  const animatedStyle = useAnimatedStyle(() => {
    const totalAngle = continuousRotation.value + buttonRotation.value * 0.3;
    return {
      transform: [{ rotate: `${totalAngle}deg` }],
    };
  });

  return (
    <View pointerEvents='none' style={styles.cosmicAnchor}>
      {/* Soft atmospheric background glow */}
      <Svg
        height={1400}
        width={1400}
        viewBox='-700 -700 1400 1400'
        style={styles.glowUnderlay}
      >
        <Defs>
          <RadialGradient
            id='vortexGlow'
            cx='0'
            cy='0'
            rx='700'
            ry='700'
            gradientUnits='userSpaceOnUse'
          >
            <Stop offset='0%' stopColor='#7E57C2' stopOpacity='0.25' />
            <Stop offset='35%' stopColor='#3F51B5' stopOpacity='0.15' />
            <Stop offset='70%' stopColor='#00E5FF' stopOpacity='0.08' />
            <Stop offset='100%' stopColor='#000000' stopOpacity='0' />
          </RadialGradient>
        </Defs>
        <Circle cx='0' cy='0' r='680' fill='url(#vortexGlow)' />
      </Svg>

      <Animated.View style={[styles.cosmicRotator, animatedStyle]}>
        <Svg height={1400} width={1400} viewBox='-700 -700 1400 1400'>
          <Defs>
            {/* Soft Luminous Golden Sweep Arc */}
            <LinearGradient id='goldGlow' x1='0%' y1='0%' x2='100%' y2='100%'>
              <Stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.6' />
              <Stop offset='40%' stopColor='#FFF9C4' stopOpacity='0.45' />
              <Stop offset='80%' stopColor='#FFD54F' stopOpacity='0.2' />
              <Stop offset='100%' stopColor='#FFA000' stopOpacity='0' />
            </LinearGradient>

            {/* Soft Cyan/Violet Gradient */}
            <LinearGradient id='trackGrad' x1='0%' y1='100%' x2='100%' y2='0%'>
              <Stop offset='0%' stopColor='#80DEEA' stopOpacity='0.45' />
              <Stop offset='50%' stopColor='#B388FF' stopOpacity='0.3' />
              <Stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.1' />
            </LinearGradient>
          </Defs>

          {/* Orbit 1: Inner orbit around button */}
          <Circle
            cx='0'
            cy='0'
            r='85'
            stroke='rgba(255, 255, 255, 0.25)'
            strokeWidth='1.5'
            strokeDasharray='6, 5'
            fill='none'
          />

          {/* Orbit 2: Cyan track with directional arrow */}
          <Circle
            cx='0'
            cy='0'
            r='150'
            stroke='url(#trackGrad)'
            strokeWidth='1.8'
            fill='none'
          />

          {/* Orbit 3: Main glowing sweep arc (reduced opacity) */}
          <Path d='M -12,210 L 6,224 L 6,196 Z' fill='#FFFDE7' opacity={0.65} />
          <Path
            d='M 210,0 A 210 210 0 0 1 0,210'
            stroke='url(#goldGlow)'
            strokeWidth='4.5'
            strokeLinecap='round'
            fill='none'
          />

          {/* Orbit 4: Medium orbit spreading mid-screen */}
          <Circle
            cx='0'
            cy='0'
            r='300'
            stroke='rgba(255, 255, 255, 0.18)'
            strokeWidth='1.6'
            strokeDasharray='10, 8'
            fill='none'
          />
          <Path
            d='M 0,-300 L -8,-288 L 8,-288 Z'
            fill='rgba(255, 255, 255, 0.45)'
          />

          {/* Orbit 5: Wide orbit sweeping upper-mid screen */}
          <Circle
            cx='0'
            cy='0'
            r='440'
            stroke='rgba(255, 255, 255, 0.14)'
            strokeWidth='1.6'
            fill='none'
          />
          <Path
            d='M 311,-311 L 300,-300 L 322,-300 Z'
            fill='rgba(255, 255, 255, 0.35)'
          />

          {/* Orbit 6: Full screen coverage orbit */}
          <Circle
            cx='0'
            cy='0'
            r='600'
            stroke='rgba(255, 255, 255, 0.1)'
            strokeWidth='1.4'
            strokeDasharray='14, 12'
            fill='none'
          />

          {/* Subdued Sparkle & Twinkle Elements */}
          <FourPointStar x={130} y={-120} size={14} opacity={0.5} />
          <FourPointStar x={-220} y={170} size={12} opacity={0.45} />
          <FourPointStar x={300} y={220} size={11} opacity={0.4} />
          <SparkleStar cx={-70} cy={-180} r={3} opacity={0.5} />
          <SparkleStar cx={-180} cy={-95} r={2.5} opacity={0.45} />
          <SparkleStar cx={160} cy={150} r={2.8} opacity={0.5} />
          <SparkleStar cx={-100} cy={240} r={2.2} opacity={0.4} />
          <SparkleStar cx={270} cy={-130} r={3} opacity={0.45} />
          <SparkleStar cx={-30} cy={-320} r={2.5} opacity={0.35} />
          <SparkleStar cx={-330} cy={60} r={2.8} opacity={0.35} />
          <SparkleStar cx={230} cy={280} r={2.6} opacity={0.4} />
          <SparkleStar cx={380} cy={-80} r={2.5} opacity={0.35} />
          <SparkleStar cx={-200} cy={-290} r={3} opacity={0.4} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Giant cosmic anchor extending rings across full display
  cosmicAnchor: {
    position: 'absolute',
    right: 32,
    bottom: 45,
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  glowUnderlay: {
    position: 'absolute',
  },
  cosmicRotator: {
    width: 1400,
    height: 1400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CosmicOrbitalTracks;
