import React from 'react';
import { View } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../hooks/useTheme';

interface DividerProps {
  title?: string;
}

const Divider = ({ title }: DividerProps) => {
  const { colors } = useTheme();

  return (
    <View className='flex-row items-center'>
      <View
        className='h-px flex-1'
        style={{
          backgroundColor: colors.border,
        }}
      />

      {title ? (
        <AppText
          variant='caption'
          className='mx-3'
          color={colors.textSecondary}
        >
          {title}
        </AppText>
      ) : null}

      <View
        className='h-px flex-1'
        style={{
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
};

export default Divider;
