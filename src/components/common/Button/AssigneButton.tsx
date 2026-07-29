import React from 'react';
import { TouchableOpacity } from 'react-native';

import AppText from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';

interface AssigneeButtonProps {
  title: string;
  selected?: boolean;
  onPress?: () => void;
}

const AssigneeButton = ({
  title,
  selected = false,
  onPress,
}: AssigneeButtonProps) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

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
      className='items-center justify-center rounded-xl border-2'
      style={{
        borderColor,
        backgroundColor,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.tightGap * 1.5,
        marginRight: layout.elementGap,
        marginBottom: layout.elementGap,
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

export default AssigneeButton;
