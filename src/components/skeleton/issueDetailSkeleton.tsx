import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { useTheme } from '../../theme/ThemeProvider';

interface TaskRowsSkeletonProps {
  taskCount?: number;
}

export const TaskRowsSkeleton: React.FC<TaskRowsSkeletonProps> = ({
  taskCount = 4,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
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
    <View>
      {Array.from({ length: taskCount }).map((_, index) => (
        <View
          key={index}
          className='flex-row items-center border-b'
          style={{
            height: moderateScale(56),
            borderColor: colors.border,
          }}
        >
          {/* ================= WORK ================= */}
          <View
            style={{
              width: '43%',
              paddingRight: moderateScale(10),
              justifyContent: 'center',
            }}
          >
            {/* Task title */}
            <Animated.View
              style={{
                width: index === 0 ? '72%' : index === 1 ? '82%' : '88%',
                height: moderateScale(14),
                backgroundColor: skeletonBg,
                borderRadius: moderateScale(4),
                opacity: pulseAnim,
                marginBottom: moderateScale(6),
              }}
            />

            {/* Task key */}
            <Animated.View
              style={{
                width: moderateScale(55),
                height: moderateScale(10),
                backgroundColor: skeletonBg,
                borderRadius: moderateScale(4),
                opacity: pulseAnim,
              }}
            />
          </View>

          {/* ================= PRIORITY ================= */}
          <View
            style={{
              width: '27%',
              justifyContent: 'center',
              paddingLeft: moderateScale(4),
            }}
          >
            <Animated.View
              style={{
                width: moderateScale(58),
                height: moderateScale(28),
                backgroundColor: skeletonBg,
                borderRadius: Radius.circle,
                opacity: pulseAnim,
              }}
            />
          </View>

          {/* ================= ASSIGNEE ================= */}
          <View
            className='flex-row items-center'
            style={{
              width: '30%',
              gap: moderateScale(8),
            }}
          >
            {/* Avatar */}
            <Animated.View
              style={{
                width: moderateScale(32),
                height: moderateScale(32),
                borderRadius: Radius.circle,
                backgroundColor: skeletonBg,
                opacity: pulseAnim,
              }}
            />

            {/* Assignee name */}
            <Animated.View
              style={{
                width: moderateScale(58),
                height: moderateScale(12),
                backgroundColor: skeletonBg,
                borderRadius: moderateScale(4),
                opacity: pulseAnim,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

interface CommentSkeletonItemProps {
  isReply?: boolean;
}

export const CommentSkeletonItem: React.FC<CommentSkeletonItemProps> = ({
  isReply = false,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

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
    <View
      className='flex-row'
      style={{
        marginLeft: isReply ? moderateScale(38) : 0,
        paddingLeft: isReply ? moderateScale(18) : 0,
        borderLeftWidth: isReply ? 2 : 0,
        borderLeftColor: colors.border,
        marginBottom: moderateScale(12),
      }}
    >
      {/* Avatar */}
      <Animated.View
        style={{
          width: moderateScale(34),
          height: moderateScale(34),
          borderRadius: Radius.circle,
          backgroundColor: skeletonBg,
          opacity: pulseAnim,
          marginRight: moderateScale(16),
        }}
      />

      {/* Comment Content */}
      <View
        style={{
          flex: 1,
        }}
      >
        {/* Name + Time */}
        <View
          className='flex-row items-center'
          style={{
            gap: moderateScale(9),
            marginBottom: moderateScale(9),
          }}
        >
          <Animated.View
            style={{
              width: moderateScale(62),
              height: moderateScale(14),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />

          <Animated.View
            style={{
              width: moderateScale(105),
              height: moderateScale(12),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />
        </View>

        {/* Comment Text - single line */}
        <Animated.View
          style={{
            width: '80%',
            height: moderateScale(14),
            backgroundColor: skeletonBg,
            borderRadius: Radius.xs || 4,
            opacity: pulseAnim,
            marginBottom: moderateScale(10),
          }}
        />

        {/* Reply / Hide Replies */}
        <View
          className='flex-row items-center'
          style={{
            gap: moderateScale(14),
          }}
        >
          <Animated.View
            style={{
              width: moderateScale(42),
              height: moderateScale(12),
              backgroundColor: skeletonBg,
              borderRadius: Radius.xs || 4,
              opacity: pulseAnim,
            }}
          />

          {!isReply && (
            <Animated.View
              style={{
                width: moderateScale(65),
                height: moderateScale(12),
                backgroundColor: skeletonBg,
                borderRadius: Radius.xs || 4,
                opacity: pulseAnim,
              }}
            />
          )}
        </View>
      </View>

      {/* Edit / Delete */}
      <View
        className='flex-row items-center'
        style={{
          gap: moderateScale(14),
          marginLeft: moderateScale(8),
          paddingTop: moderateScale(42),
        }}
      >
        <Animated.View
          style={{
            width: moderateScale(17),
            height: moderateScale(17),
            backgroundColor: skeletonBg,
            borderRadius: Radius.xs || 4,
            opacity: pulseAnim,
          }}
        />

        <Animated.View
          style={{
            width: moderateScale(17),
            height: moderateScale(17),
            backgroundColor: skeletonBg,
            borderRadius: Radius.xs || 4,
            opacity: pulseAnim,
          }}
        />
      </View>
    </View>
  );
};

export const CommentsSectionSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: moderateScale(4),
        paddingBottom: moderateScale(8),
      }}
    >
      {/* Parent Comment */}
      <CommentSkeletonItem />

      {/* Reply */}
      <CommentSkeletonItem isReply />
    </View>
  );
};
