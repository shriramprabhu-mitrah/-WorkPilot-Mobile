import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';

import AppText from '../components/common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';

interface Props {
  initials?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string | null;
  dimension?: number;
}

const Avatar = ({
  initials,
  color,
  size = 'medium',
  imageUrl,
  dimension: customDimension,
}: Props) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  // Pick responsive dimension based on the size prop
  const dimension =
    customDimension ??
    (size === 'small'
      ? layout.avatarSizeSmall
      : size === 'large'
        ? layout.avatarSizeLarge
        : layout.avatarSize);

  // Empty state / Placeholder state
  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    overflow: 'hidden' as const,
  };

  if (imageUrl && !imageFailed) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
          onError={() => setImageFailed(true)}
        />
      </View>
    );
  }

  if (!initials) {
    return (
      <View
        style={{
          ...containerStyle,
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
        ...containerStyle,
        backgroundColor: color ?? colors.primary,
      }}
    >
      <AppText
        variant='caption'
        color={colors.white}
        className='font-bold'
        style={{ fontSize: Math.max(11, dimension * 0.36) }}
      >
        {initials}
      </AppText>
    </View>
  );
};

export default Avatar;
