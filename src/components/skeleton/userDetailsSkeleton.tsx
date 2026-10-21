import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useTheme } from '../../hooks/useTheme';

export const UserDetailsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {[0, 1, 2, 3].map(item => (
        <View
          key={item}
          style={{
            padding: 15,
            gap: 11,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Skeleton
            animation='wave'
            width='32%'
            height={14}
            style={{ backgroundColor: colors.surface }}
          />
          <Skeleton
            animation='wave'
            width='78%'
            height={18}
            style={{ backgroundColor: colors.surface }}
          />
          <Skeleton
            animation='wave'
            width='48%'
            height={12}
            style={{ backgroundColor: colors.surface }}
          />
        </View>
      ))}
    </View>
  );
};
