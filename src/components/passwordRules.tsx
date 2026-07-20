import React, { useMemo } from 'react';
import { View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

interface Props {
  password: string;
}

const PasswordRules = ({ password }: Props) => {
  const { colors } = useTheme();
  const { hp, moderateScale } = useResponsive();

  const rules = useMemo(() => [
    { title: 'At least 8 characters', valid: password.length >= 8 },
    { title: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { title: 'One number', valid: /[0-9]/.test(password) },
    { title: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>_\-\\\[\]/+=~`]/.test(password) },
  ], [password]);

  if (!password.length) return null;

  const iconSize = moderateScale(20);

  return (
    <View style={{ marginTop: hp(2) }}>
      {rules.map(rule => (
        <View
          key={rule.title}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(1) }}>
          <View
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: rule.valid ? colors.success : colors.border,
            }}>
            {rule.valid && (
              <Ionicons name="checkmark" size={moderateScale(12)} color={colors.white} />
            )}
          </View>
          <AppText
            variant="caption"
            style={{ marginLeft: moderateScale(10) }}
            color={rule.valid ? colors.success : colors.textSecondary}>
            {rule.title}
          </AppText>
        </View>
      ))}
    </View>
  );
};

export default PasswordRules;
