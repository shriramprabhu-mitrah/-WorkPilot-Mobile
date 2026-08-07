import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { useTheme } from '../../hooks/useTheme';

const TrendingItemSkeleton = () => {
  const { layout } = useAuthLayout();
  const { colors } = useTheme();

  return (
    <View
      className="mb-3 flex-row items-center rounded-2xl border"
      style={{
        marginHorizontal: layout.paddingHorizontal,
        backgroundColor: colors.card || colors.surface,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.elementGap,
      }}
    >
      <Skeleton
        width={layout.avatarSizeSmall}
        height={layout.avatarSizeSmall}
        style={{ borderRadius: 8 }}
      />

      <View
        style={{
          flex: 1,
          marginLeft: layout.tightGap,
        }}
      >
        <Skeleton
          width="65%"
          height={layout.bodyFontSize}
          style={{ borderRadius: layout.bodyFontSize / 2 }}
        />

        <Skeleton
          width="40%"
          height={layout.captionFontSize}
          style={{
            marginTop: layout.tightGap / 2,
            borderRadius: layout.captionFontSize / 2,
          }}
        />
      </View>

      <Skeleton
        width={layout.iconSize * 0.7}
        height={layout.iconSize * 0.7}
        style={{ borderRadius: layout.iconSize }}
      />
    </View>
  );
};

export default TrendingItemSkeleton;