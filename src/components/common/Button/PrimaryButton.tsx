import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import AppText from '../AppText';
import { useAuthLayout } from '../../../hooks/useAuthLayout';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: any;
  textColor?: string;
}

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  className = '',
  style,
  textColor = 'white',
}: Props) => {
  const { colors } = useTheme();
  const { isSmallHeight, isLargeHeight, verticalScale } = useAuthLayout();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className={className}
      style={[
        {
          backgroundColor: colors.primary,
          paddingVertical: isSmallHeight
            ? verticalScale(10)
            : isLargeHeight
              ? verticalScale(16)
              : verticalScale(12),
          borderRadius: Radius.md,
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant='button' color={textColor}>
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
