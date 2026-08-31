import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';

export const FilterChipSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View
      className='flex-row items-center rounded-xl border px-3 py-2'
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        width: moderateScale(120),
      }}
    >
      {/* Icon Skeleton */}
      <Animated.View
        className='mr-2 rounded-md'
        style={{
          width: moderateScale(18),
          height: moderateScale(18),
          backgroundColor: colors.border || '#E5E7EB',
          opacity: pulseAnim,
        }}
      />

      {/* Text Line Skeleton */}
      <Animated.View
        className='rounded'
        style={{
          width: moderateScale(65),
          height: moderateScale(12),
          backgroundColor: colors.border || '#E5E7EB',
          opacity: pulseAnim,
        }}
      />
    </View>
  );
};
