import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { moderateScale } from '../../utils/responsive';

export const SkeletonBox = ({
  width,
  height,
  borderRadius = 4,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.4);
  useAnimatedReaction(
    () => opacity.value,
    () => {},
  );

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    let ascending = true;
    const interval = setInterval(() => {
      if (ascending) {
        opacity.value = opacity.value < 0.85 ? opacity.value + 0.07 : 0.85;
        if (opacity.value >= 0.85) ascending = false;
      } else {
        opacity.value = opacity.value > 0.3 ? opacity.value - 0.07 : 0.3;
        if (opacity.value <= 0.3) ascending = true;
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animStyle,
        style,
      ]}
    />
  );
};

export const BoardSkeletonRow = ({ columnCount }: { columnCount: number }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 100,
      }}
    >
      <View
        style={{
          width: moderateScale(250),
          padding: 12,
          backgroundColor: colors.card || colors.surface,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SkeletonBox width={12} height={12} borderRadius={6} />
          <SkeletonBox width={140} height={14} />
        </View>
        <SkeletonBox width={80} height={10} />
      </View>

      {Array.from({ length: columnCount }).map((_, i) => (
        <View
          key={i}
          style={{
            width: moderateScale(260),
            minHeight: 100,
            padding: 8,
            borderLeftWidth: 1,
            borderLeftColor: colors.border,
            gap: 8,
          }}
        >
          {i === 0 && (
            <>
              <SkeletonBox width='100%' height={56} borderRadius={8} />
              <SkeletonBox width='100%' height={56} borderRadius={8} />
            </>
          )}
        </View>
      ))}
    </View>
  );
};

export const BoardSkeleton = ({ columnCount }: { columnCount: number }) => {
  const { colors } = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ width: moderateScale(250), padding: 12 }}>
          <SkeletonBox width={100} height={14} />
        </View>
        {Array.from({ length: columnCount }).map((_, i) => (
          <View
            key={i}
            style={{
              width: moderateScale(260),
              padding: 12,
              borderLeftWidth: 1,
              borderLeftColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <SkeletonBox width={10} height={10} borderRadius={5} />
              <SkeletonBox width={80} height={14} />
            </View>
          </View>
        ))}
      </View>
      {Array.from({ length: 5 }).map((_, i) => (
        <BoardSkeletonRow key={i} columnCount={columnCount} />
      ))}
    </View>
  );
};
