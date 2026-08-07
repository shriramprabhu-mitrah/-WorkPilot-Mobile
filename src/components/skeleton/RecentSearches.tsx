import { Skeleton } from '@rneui/themed';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';

const RecentSearches = () => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  return (
    <View
      className='mb-6 overflow-hidden rounded-2xl border'
      style={{
        borderColor: colors.border,
        backgroundColor: colors.card || colors.surface,
      }}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
            borderBottomWidth: index !== 2 ? 1 : 0,
            borderColor: colors.itemDivider || colors.border,
          }}
        >
          {/* Left Icon */}
          <Skeleton
            circle
            width={layout.iconSize * 0.75}
            height={layout.iconSize * 0.75}
          />

          {/* Text */}
          <View
            style={{
              flex: 1,
              marginLeft: layout.tightGap,
            }}
          >
            <Skeleton
              width='70%'
              height={layout.bodyFontSize}
              style={{
                borderRadius: layout.bodyFontSize / 2,
              }}
            />
          </View>

          {/* Right Arrow */}
          <Skeleton
            width={layout.iconSize * 0.7}
            height={layout.iconSize * 0.7}
            style={{
              borderRadius: layout.iconSize,
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default RecentSearches;
