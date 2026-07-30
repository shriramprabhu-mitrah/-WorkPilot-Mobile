import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import AppText from '../../common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { Radius } from '../../../constants/Radius';

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
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`items-center border-2`}
      style={{
        borderColor: selected ? `${colors.primary}` : `${colors.border}`,
        backgroundColor: selected ? `${colors.primary}1A` : `${colors.surface}`,
        paddingHorizontal: layout.paddingHorizontal * 0.5,
        paddingTop: layout.paddingTop * 0.75,
        paddingBottom: layout.paddingBottom * 0.75,
        gap: layout.tightGap,
        borderRadius: Radius.sm,
      }}
    >
      <View
        className='rounded-full'
        style={{
          width: moderateScale(8),
          height: moderateScale(8),
          backgroundColor: color,
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
