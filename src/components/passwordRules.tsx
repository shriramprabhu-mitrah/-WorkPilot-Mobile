import React, { useMemo } from 'react';
import { View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

interface Props {
  password?: string;
}

const PasswordRules = ({ password = '' }: Props) => {
  const { colors, strings } = useTheme();
  const { hp, moderateScale } = useResponsive();
  const safePassword = password || '';

  const rules = useMemo(
    () => [
      { title: `${strings.signUp.passwordRules.minLength}`, valid: password.length >= 8 },
      { title: `${strings.signUp.passwordRules.uppercase}`, valid: /[A-Z]/.test(password) },
      { title: `${strings.signUp.passwordRules.number}`, valid: /[0-9]/.test(password) },
      {
        title: `${strings.signUp.passwordRules.specialCharacter}`,
        valid: /[!@#$%^&*(),.?":{}|<>_\-\\\[\]/+=~`]/.test(password),
      },
    ],
    [password]
  );

  if (!safePassword.length) return null;

  const isAllValid = rules.every((rule) => rule.valid);
  if (isAllValid) return null;

  const iconSize = moderateScale(18);

  return (
    <View
      className="absolute bottom-full left-0 right-0 mb-1.5 p-3 rounded-lg border z-50 shadow-md elevation-5"
      style={{
        backgroundColor: colors.background || colors.white,
        borderColor: colors.border,
      }}
    >
      {rules.map((rule) => (
        <View
          key={rule.title}
          className="flex-row items-center"
          style={{ marginBottom: hp(0.8) }}
        >
          <View
            className="items-center justify-center"
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: rule.valid ? colors.success : colors.border,
            }}
          >
            {rule.valid && (
              <Ionicons
                name="checkmark"
                size={moderateScale(11)}
                color={colors.white}
              />
            )}
          </View>
          <AppText
            variant="caption"
            style={{ marginLeft: moderateScale(10) }}
            color={rule.valid ? colors.success : colors.textSecondary}
          >
            {rule.title}
          </AppText>
        </View>
      ))}
    </View>
  );
};

export default PasswordRules;