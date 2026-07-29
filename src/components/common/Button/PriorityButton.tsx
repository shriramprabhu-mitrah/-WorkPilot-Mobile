import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import AppText from '../../common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';

interface PriorityButtonProps {
  title: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
}

const PriorityButton = ({
  title,
  color,
  selected = false,
  onPress,
}: PriorityButtonProps) => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const borderColor = selected ? colors.primary : colors.border;
  const backgroundColor = selected
    ? colors.info
      ? `${colors.info}20`
      : `${colors.primary}15`
    : colors.surface || colors.background;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className='items-center justify-center rounded-lg border-2'
      style={{
        borderColor,
        backgroundColor,
        paddingHorizontal: layout.paddingHorizontal / 1.2,
        paddingVertical: layout.tightGap,
      }}
    >
      <View
        className='rounded-full'
        style={{
          width: moderateScale(8),
          height: moderateScale(8),
          backgroundColor: color,
          marginBottom: layout.tightGap / 2,
        }}
      />
      <AppText
        variant='caption'
        color={selected ? colors.primary : colors.text}
        className={selected ? 'font-bold' : 'font-medium'}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default PriorityButton;
