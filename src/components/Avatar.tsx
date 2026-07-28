import React from 'react';
import { View } from 'react-native';

import AppText from '../components/common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';

interface Props {
  initials?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const Avatar = ({ initials, color, size = 'medium' }: Props) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  // Pick responsive dimension based on the size prop
  const dimension =
    size === 'small'
      ? layout.avatarSizeSmall
      : size === 'large'
        ? layout.avatarSizeLarge
        : layout.avatarSize;

  // Empty state / Placeholder state
  if (!initials) {
    return (
      <View
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderColor: colors.border,
          borderWidth: 2,
          borderStyle: 'dashed',
        }}
      />
    );
  }

  return (
    <View
      className='items-center justify-center'
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: color ?? colors.primary,
      }}
    >
      <AppText variant='caption' color={colors.white} className='font-bold'>
        {initials}
      </AppText>
    </View>
  );
};

export default Avatar;
