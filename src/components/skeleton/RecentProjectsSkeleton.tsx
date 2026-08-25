import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useTheme } from '../../theme/ThemeProvider';
import { moderateScale } from '../../utils/responsive';
import { Radius } from '../../constants/Radius';

const RecentProjectCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      className='flex-row items-center border p-3'
      style={{
        width: moderateScale(200),
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: Radius?.lg || 12,
        gap: 12,
      }}
    >
      {/* Icon Box Skeleton */}
      <Skeleton
        animation='wave'
        width={moderateScale(30)}
        height={moderateScale(30)}
        style={{
          borderRadius: Radius?.sm || 8,
          backgroundColor: colors.surface || colors.background,
        }}
      />

      {/* Project Name & Subtitle Skeleton */}
      <View className='flex-1 justify-center' style={{ gap: 6 }}>
        <Skeleton
          animation='wave'
          width='80%'
          height={15}
          style={{
            borderRadius: Radius?.xs || 4,
            backgroundColor: colors.surface || colors.background,
          }}
        />
        <Skeleton
          animation='wave'
          width='60%'
          height={11}
          style={{
            borderRadius: Radius?.xs || 4,
            backgroundColor: colors.surface || colors.background,
          }}
        />
      </View>
    </View>
  );
};

export default RecentProjectCardSkeleton;
