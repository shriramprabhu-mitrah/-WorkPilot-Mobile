import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';

const RecentActivitySkeleton = () => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <View
      className='rounded-xl border'
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={index}
          className={`flex-row items-start px-4 py-3 ${
            index !== 3 ? 'border-b' : ''
          }`}
          style={{
            borderColor: colors.itemDivider,
          }}
        >
          {/* Skeleton Dot */}
          <View
            className='mr-3 mt-2 rounded-full'
            style={{
              width: moderateScale(8),
              height: moderateScale(8),
              backgroundColor: colors.border,
              opacity: 0.6,
            }}
          />

          {/* Skeleton Text Content */}
          <View className='flex-1'>
            {/* Title Skeleton */}
            <View
              className='rounded-md'
              style={{
                height: moderateScale(16),
                width: index % 2 === 0 ? '75%' : '60%',
                backgroundColor: colors.border,
                opacity: 0.6,
              }}
            />

            {/* Subtitle / Meta Skeleton */}
            <View
              className='mt-2 rounded-md'
              style={{
                height: moderateScale(12),
                width: index % 2 === 0 ? '40%' : '50%',
                backgroundColor: colors.border,
                opacity: 0.4,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default RecentActivitySkeleton;
