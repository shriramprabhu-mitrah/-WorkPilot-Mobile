import React from 'react';
import { View } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

import AppText from '../AppText';
import { useResponsive } from '../../../utils/responsive';

interface Props extends BaseToastProps {
  type: 'success' | 'error';
}

const CustomToast = ({ text1, text2, type }: Props) => {
  const { moderateScale, verticalScale } = useResponsive();

  const borderColor = type === 'success' ? '#22C55E' : '#EF4444';

  return (
    <View
      style={{
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        borderLeftWidth: moderateScale(5),
        borderLeftColor: borderColor,
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(12),
        elevation: 5,
      }}
    >
      <AppText
        style={{
          fontSize: moderateScale(16),
          fontWeight: '700',
        }}
      >
        {text1}
      </AppText>

      {!!text2 && (
        <AppText
          style={{
            marginTop: verticalScale(4),
            fontSize: moderateScale(14),
          }}
        >
          {text2}
        </AppText>
      )}
    </View>
  );
};

export default CustomToast;
