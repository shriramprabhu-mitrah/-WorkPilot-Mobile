import React from 'react';
import { View } from 'react-native';
import JiraLogo from '../assets/svg/splasScreenlogo';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const AuthLogoHeader = () => {
  const { colors, strings } = useTheme();
  const { moderateScale, fontScale } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        alignItems: 'center',
        paddingVertical: moderateScale(20),
        gap: moderateScale(8),
      }}
    >
      <JiraLogo width={moderateScale(40)} height={moderateScale(40)} />
      <AppText
        variant='h2'
        color={colors.white}
        style={{
          fontSize: fontScale(22),
        }}
      >
        {strings.splash.title}
      </AppText>
    </View>
  );
};

export default AuthLogoHeader;
