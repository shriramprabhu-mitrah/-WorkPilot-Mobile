import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { Radius } from '../../../constants/Radius';

interface SearchCardSkeletonProps {
  isMember?: boolean;
}

export const SearchCardSkeleton: React.FC<SearchCardSkeletonProps> = ({
  isMember = false,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <View
      className='border'
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: Radius.sm,
        padding: moderateScale(14),
        marginBottom: moderateScale(10),
      }}
    >
      {isMember ? (
        <View className='flex-row items-center'>
          <Skeleton
            animation='wave'
            circle
            width={moderateScale(48)}
            height={moderateScale(48)}
            style={{ backgroundColor: colors.surface }}
          />
          <View
            className='flex-1 justify-center'
            style={{ marginLeft: moderateScale(12), gap: moderateScale(6) }}
          >
            <View className='flex-row items-center justify-between'>
              <Skeleton
                animation='wave'
                width='45%'
                height={moderateScale(15)}
                style={{
                  borderRadius: Radius.xs,
                  backgroundColor: colors.surface,
                }}
              />
              <Skeleton
                animation='wave'
                width={moderateScale(60)}
                height={moderateScale(20)}
                style={{
                  borderRadius: Radius.pill,
                  backgroundColor: colors.surface,
                }}
              />
            </View>
            <Skeleton
              animation='wave'
              width='35%'
              height={moderateScale(12)}
              style={{
                borderRadius: Radius.xs,
                backgroundColor: colors.surface,
              }}
            />
            <Skeleton
              animation='wave'
              width='60%'
              height={moderateScale(11)}
              style={{
                borderRadius: Radius.xs,
                backgroundColor: colors.surface,
              }}
            />
          </View>
        </View>
      ) : (
        <View>
          {/* Header Row */}
          <View className='flex-row items-center justify-between'>
            <View
              className='flex-1 flex-row items-center'
              style={{ gap: moderateScale(6) }}
            >
              <Skeleton
                animation='wave'
                width={moderateScale(75)}
                height={moderateScale(18)}
                style={{
                  borderRadius: Radius.sm,
                  backgroundColor: colors.surface,
                }}
              />
              <Skeleton
                animation='wave'
                width='40%'
                height={moderateScale(12)}
                style={{
                  borderRadius: Radius.xs,
                  backgroundColor: colors.surface,
                }}
              />
            </View>
            <Skeleton
              animation='wave'
              width={moderateScale(14)}
              height={moderateScale(14)}
              style={{
                borderRadius: Radius.circle,
                backgroundColor: colors.surface,
              }}
            />
          </View>

          {/* Title */}
          <Skeleton
            animation='wave'
            width='85%'
            height={moderateScale(16)}
            style={{
              borderRadius: Radius.xs,
              marginVertical: moderateScale(10),
              backgroundColor: colors.surface,
            }}
          />

          {/* Badges Footer */}
          <View
            className='flex-row items-center'
            style={{ gap: moderateScale(8) }}
          >
            <Skeleton
              animation='wave'
              width={moderateScale(65)}
              height={moderateScale(20)}
              style={{
                borderRadius: Radius.pill,
                backgroundColor: colors.surface,
              }}
            />
            <Skeleton
              animation='wave'
              width={moderateScale(55)}
              height={moderateScale(20)}
              style={{
                borderRadius: Radius.pill,
                backgroundColor: colors.surface,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};
