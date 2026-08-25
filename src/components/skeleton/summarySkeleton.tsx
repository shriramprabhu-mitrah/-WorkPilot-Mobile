import React, { useEffect, useRef } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { useTheme } from '../../theme/ThemeProvider';

export const SummarySkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const skeletonBg = colors.border || '#E5E7EB';

  return (
    <ScrollView
      className='flex-1'
      style={{ backgroundColor: colors.surface, paddingTop: moderateScale(20) }}
    >
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: moderateScale(100),
          gap: isSmallHeight ? layout.largeSectionGap * 3 : layout.sectionGap,
        }}
      >
        {/* 4 Metrics Cards Skeleton Grid */}
        <View
          className='flex-row flex-wrap justify-between'
          style={{ gap: moderateScale(12) }}
        >
          {[1, 2, 3, 4].map(key => (
            <View
              key={key}
              className='w-[48%] justify-between'
              style={{
                padding: moderateScale(12),
                backgroundColor: colors.background,
                borderRadius: Radius.lg,
                gap: layout.mediumGap,
              }}
            >
              {/* Icon Placeholder */}
              <Animated.View
                style={{
                  width: moderateScale(34),
                  height: moderateScale(34),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.sm,
                  opacity: pulseAnim,
                }}
              />
              {/* Main Metric Text Placeholder */}
              <Animated.View
                style={{
                  width: '70%',
                  height: moderateScale(16),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.xs || 4,
                  opacity: pulseAnim,
                }}
              />
              {/* Subtext Placeholder */}
              <Animated.View
                style={{
                  width: '50%',
                  height: moderateScale(12),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.xs || 4,
                  opacity: pulseAnim,
                }}
              />
            </View>
          ))}
        </View>

        {/* Status Overview Container Skeleton */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
            padding: moderateScale(20),
          }}
        >
          {/* Header & Subtitle Skeleton */}
          <Animated.View
            style={{
              width: moderateScale(140),
              height: moderateScale(18),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />
          <Animated.View
            style={{
              width: moderateScale(100),
              height: moderateScale(12),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              marginTop: moderateScale(6),
              marginBottom: moderateScale(20),
              opacity: pulseAnim,
            }}
          />

          {/* Donut Ring Placeholder */}
          <View
            className='items-center justify-center'
            style={{ marginVertical: moderateScale(10) }}
          >
            <Animated.View
              style={{
                width: moderateScale(220),
                height: moderateScale(220),
                borderRadius: moderateScale(110),
                borderWidth: moderateScale(35),
                borderColor: skeletonBg,
                opacity: pulseAnim,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </View>

          {/* List Items Skeleton */}
          {[1, 2, 3, 4].map(item => (
            <View
              key={item}
              className='flex-row items-center justify-between'
              style={{ paddingVertical: moderateScale(12) }}
            >
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <Animated.View
                  style={{
                    backgroundColor: skeletonBg,
                    width: moderateScale(12),
                    height: moderateScale(12),
                    borderRadius: Radius.circle,
                    opacity: pulseAnim,
                  }}
                />
                <Animated.View
                  style={{
                    width: moderateScale(70),
                    height: moderateScale(14),
                    backgroundColor: skeletonBg,
                    borderRadius: Radius.xs || 4,
                    opacity: pulseAnim,
                  }}
                />
              </View>
              <Animated.View
                style={{
                  width: moderateScale(20),
                  height: moderateScale(14),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.xs || 4,
                  opacity: pulseAnim,
                }}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SummarySkeleton;
