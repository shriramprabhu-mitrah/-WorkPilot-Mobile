import React from 'react';
import { TouchableOpacity } from 'react-native';

import AppText from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { Radius } from '../../../constants/Radius';

interface NumberButtonProps {
  title: string | number;
  selected?: boolean;
  onPress?: () => void;
}

const NumberButton = ({
  title,
  selected = false,
  onPress,
}: NumberButtonProps) => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const borderColor = selected ? colors.primary : colors.border;
  const backgroundColor = selected
    ? colors.info
      ? `${colors.info}20`
      : `${colors.primary}15`
    : colors.surface || colors.background;
  const size = moderateScale(40);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className='items-center justify-center border-2'
      style={{
        width: size,
        height: size,
        borderColor,
        backgroundColor,
        marginRight: layout.elementGap,
        marginBottom: layout.elementGap,
        borderRadius: Radius.sm,
      }}
    >
      <AppText
        variant='body'
        color={selected ? colors.primary : colors.text}
        className={selected ? 'font-bold' : 'font-semibold'}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default NumberButton;
