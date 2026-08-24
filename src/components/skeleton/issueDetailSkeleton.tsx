import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import CommonHeader from '../common/CommonHeader';
import Screen from '../common/ScreenWapper';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';

export const IssueDetailSkeleton = () => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

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
    <Screen scroll={false} className='pb-12' backgroundColor={colors.surface}>
      {/* Header matching custom variant with back arrow, title placeholder, and serial # */}

      <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
        {/* Top Header Section: Task Title & Status Pill */}
        <View className='mb-4 space-y-3' style={{ gap: moderateScale(12) }}>
          <Animated.View
            style={{
              width: '60%',
              height: moderateScale(24),
              backgroundColor: skeletonBg,
              borderRadius: Radius.md,
              opacity: pulseAnim,
            }}
          />
          <Animated.View
            style={{
              width: moderateScale(112),
              height: moderateScale(36),
              backgroundColor: skeletonBg,
              borderRadius: Radius.lg,
              opacity: pulseAnim,
            }}
          />
        </View>

        {/* Meta Details Section (Assignee, Reporter, Priority, Story pts rows) */}
        <View
          className='mb-4 rounded-2xl border p-4'
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
            gap: moderateScale(16),
          }}
        >
          {/* Assignee Row */}
          <View className='flex-row items-center justify-between'>
            <Animated.View
              style={{
                width: moderateScale(80),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(8) }}
            >
              <Animated.View
                style={{
                  width: moderateScale(24),
                  height: moderateScale(24),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.circle,
                  opacity: pulseAnim,
                }}
              />
              <Animated.View
                style={{
                  width: moderateScale(112),
                  height: moderateScale(16),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.xs || 4,
                  opacity: pulseAnim,
                }}
              />
            </View>
          </View>

          {/* Reporter Row */}
          <View className='flex-row items-center justify-between'>
            <Animated.View
              style={{
                width: moderateScale(80),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(8) }}
            >
              <Animated.View
                style={{
                  width: moderateScale(24),
                  height: moderateScale(24),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.circle,
                  opacity: pulseAnim,
                }}
              />
              <Animated.View
                style={{
                  width: moderateScale(112),
                  height: moderateScale(16),
                  backgroundColor: skeletonBg,
                  borderRadius: Radius.xs || 4,
                  opacity: pulseAnim,
                }}
              />
            </View>
          </View>

          {/* Priority Row */}
          <View className='flex-row items-center justify-between'>
            <Animated.View
              style={{
                width: moderateScale(64),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: moderateScale(64),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
          </View>

          {/* Story Pts Row */}
          <View className='flex-row items-center justify-between'>
            <Animated.View
              style={{
                width: moderateScale(64),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: moderateScale(24),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
          </View>
        </View>

        {/* Description Section */}
        <View
          className='mb-4 rounded-2xl border p-4'
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
          }}
        >
          <View className='mb-3 flex-row items-center justify-between'>
            <Animated.View
              style={{
                width: moderateScale(96),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: moderateScale(16),
                height: moderateScale(16),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
          </View>
          <Animated.View
            style={{
              width: '100%',
              height: moderateScale(16),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />
        </View>

        {/* Comments Header Section */}
        <View className='mb-4'>
          <Animated.View
            style={{
              width: moderateScale(96),
              height: moderateScale(20),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />
        </View>
      </ScrollView>

      {/* Bottom Comment Input Bar */}
      <View
        className='flex-row items-center border-t px-4 py-3'
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          gap: moderateScale(12),
        }}
      >
        <Animated.View
          style={{
            width: moderateScale(36),
            height: moderateScale(36),
            backgroundColor: skeletonBg,
            borderRadius: Radius.circle,
            opacity: pulseAnim,
          }}
        />
        <Animated.View
          style={{
            flex: 1,
            height: moderateScale(44),
            backgroundColor: skeletonBg,
            borderRadius: Radius.lg,
            opacity: pulseAnim,
          }}
        />
      </View>
    </Screen>
  );
};

export default IssueDetailSkeleton;
