import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import AppText from '../../../components/common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { moderateScale } from '../../../utils/responsive';
import { Radius } from '../../../constants/Radius';

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
  const bgColor =
    title === 'AJ'
      ? colors.accentOrange
      : title === 'MK'
        ? colors.primary
        : title === 'SR'
          ? colors.error
          : title === 'JL'
            ? colors.success
            : colors.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-row items-center border-2`}
      style={{
        borderColor: selected ? `${colors.primary}` : `${colors.border}`,
        backgroundColor: selected ? `${colors.primary}1A` : `${colors.surface}`,
        paddingHorizontal: layout.paddingHorizontal * 0.5,
        paddingTop: layout.paddingTop * 0.75,
        paddingBottom: layout.paddingBottom * 0.75,
        gap: layout.sectionGap,
        borderRadius: Radius.sm,
      }}
    >
      {title !== 'Unassigned' ? (
        <View
          className='flex-row'
          style={{
            gap: layout.sectionGap,
          }}
        >
          <View
            style={{
              backgroundColor: bgColor,
              width: moderateScale(22),
              height: moderateScale(22),
              borderRadius: Radius.lg,
            }}
            className='items-center justify-center rounded'
          >
            <AppText
              variant='caption'
              className='font-bold'
              style={{ color: colors.white }}
            >
              {title}
            </AppText>
          </View>
        </View>
      ) : (
        <></>
      )}
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
