import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PasswordInput from '../components/common/Input/PasswordInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import TickIcon from '../assets/svg/tickIcon';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const ResetPassword = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  const matches = password === confirm && confirm.length > 0;
  const valid = hasUpper && hasNumber && hasLength && matches;

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  return (
    <Screen scroll>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp(4),
          paddingVertical: hp(2),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: wp(4),
        }}>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Ionicons name="arrow-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="title">Reset password</AppText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: wp(6), paddingTop: hp(3) }}>
        {!done ? (
          <>
            <AppText variant="h3">Create new password</AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={{ marginTop: hp(1), marginBottom: hp(3) }}>
              Your new password must be different from your previous password.
            </AppText>

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
            />

            {password.length > 0 && (
              <View style={{ marginTop: hp(1.5), marginBottom: hp(2), gap: hp(1) }}>
                {[
                  { text: 'At least 8 characters', ok: hasLength },
                  { text: 'One uppercase letter', ok: hasUpper },
                  { text: 'One number', ok: hasNumber },
                ].map(({ text, ok }) => (
                  <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                    <View
                      style={{
                        width: moderateScale(16),
                        height: moderateScale(16),
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: ok ? colors.success : colors.border,
                      }}>
                      {ok && <TickIcon width={moderateScale(10)} height={moderateScale(10)} />}
                    </View>
                    <AppText variant="caption" color={ok ? colors.success : colors.textSecondary}>
                      {text}
                    </AppText>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: hp(2) }}>
              <PasswordInput
                label="Confirm new password"
                placeholder="Confirm your password"
                value={confirm}
                onChangeText={setConfirm}
              />
              {confirm.length > 0 && !matches && (
                <AppText variant="caption" color={colors.error} style={{ marginTop: hp(0.5) }}>
                  Passwords do not match
                </AppText>
              )}
            </View>

            <PrimaryButton
              title={loading ? 'Resetting...' : 'Reset password'}
              onPress={handleReset}
              disabled={loading || !valid}
              style={{ marginTop: hp(3) }}
            />
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: hp(4) }}>
            <View
              style={{
                width: moderateScale(80),
                height: moderateScale(80),
                backgroundColor: '#E3FCEF',
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp(3),
              }}>
              <TickIcon width={moderateScale(40)} height={moderateScale(40)} />
            </View>

            <AppText variant="h3">Password reset!</AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={{ marginTop: hp(1), marginBottom: hp(4), textAlign: 'center' }}>
              Your password has been successfully reset. You can now log in with your new password.
            </AppText>

            <PrimaryButton
              title="Back to login"
              onPress={() => navigation.navigate('login')}
              style={{ width: '100%' }}
            />
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ResetPassword;
