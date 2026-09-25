import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PasswordInput from '../components/common/Input/PasswordInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import PasswordRules from '../components/passwordRules';
import { CommonHeader } from '../components/common/CommonHeader';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { validatePasswordReset } from '../utils/validations';
import { useChangePasswordMutation } from '../store/api/homeApi';
import { showSnackbar } from '../components/common/Snackbar';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ChangePassword = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [changePasswordMutation] = useChangePasswordMutation();

  const { matches, valid } = validatePasswordReset(password, confirm);
  const isFormValid = Boolean(oldPassword.trim()) && valid;

  const handleChangePassword = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      await changePasswordMutation({
        old_password: oldPassword,
        new_password: password,
      }).unwrap();
      setDone(true);
      showSnackbar({
        message: 'Password changed successfully',
        type: 'success',
      });
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.error?.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={strings?.changePassword?.headerTitle || 'Change Password'}
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: isSmallHeight ? hp(10) : hp(8),
          flexGrow: 1,
        }}
      >
        {!done ? (
          <View className='flex-1 gap-5'>
            <View style={{ gap: layout.sectionGap }}>
              <View style={{ gap: layout.tightGap }}>
                <AppText
                  variant='bodyLarge'
                  style={{
                    fontSize: layout.titleFontSize,
                  }}
                >
                  {strings?.changePassword?.subtitle || 'Update your password'}
                </AppText>

                <AppText variant='body' color={colors.textSecondary}>
                  {strings?.changePassword?.description ||
                    'Create a new password for your account.'}
                </AppText>
              </View>

              <View style={{ gap: layout.sectionGap }}>
                {/* Old Password Input */}
                <View className='z-20'>
                  <PasswordInput
                    label={
                      strings?.changePassword?.oldPasswordLabel ||
                      'Old password'
                    }
                    placeholder={
                      strings?.changePassword?.oldPasswordPlaceholder ||
                      'Enter your current password'
                    }
                    value={oldPassword}
                    onChangeText={setOldPassword}
                  />
                </View>

                {/* New Password Input & Validation Rules */}
                <View className='relative z-20'>
                  <PasswordInput
                    label={
                      strings?.changePassword?.newPasswordLabel ||
                      'New password'
                    }
                    placeholder={
                      strings?.changePassword?.newPasswordPlaceholder ||
                      'Enter your new password'
                    }
                    value={password}
                    onChangeText={setPassword}
                  />

                  <PasswordRules password={password} />
                </View>

                {/* Confirm Password Input */}
                <View className='z-20'>
                  <PasswordInput
                    label={
                      strings?.changePassword?.confirmPasswordLabel ||
                      'Confirm new password'
                    }
                    placeholder={
                      strings?.changePassword?.confirmPasswordPlaceholder ||
                      'Confirm your password'
                    }
                    value={confirm}
                    onChangeText={setConfirm}
                  />

                  {confirm.length > 0 && !matches && (
                    <AppText
                      variant='caption'
                      color={colors.error}
                      style={{
                        marginTop: layout.tightGap,
                      }}
                    >
                      {strings?.resetPassword?.validationLabel ||
                        "Passwords don't match"}
                    </AppText>
                  )}
                </View>
              </View>
            </View>

            <View
              style={{
                marginTop: layout.sectionGap,
              }}
            >
              <PrimaryButton
                title={
                  loading
                    ? 'Changing...'
                    : strings?.changePassword?.changeButton || 'Change password'
                }
                onPress={handleChangePassword}
                disabled={loading || !isFormValid}
                loading={loading}
              />
            </View>
          </View>
        ) : (
          <View className='flex-1 justify-center gap-5'>
            <View className='items-center'>
              <View
                className='items-center justify-center rounded-full'
                style={{
                  width: moderateScale(72),
                  height: moderateScale(72),
                  backgroundColor: '#E3FCEF',
                  marginBottom: layout.sectionGap,
                }}
              >
                <AppText
                  style={{
                    fontSize: moderateScale(32),
                    color: colors.success,
                  }}
                >
                  ✓
                </AppText>
              </View>

              <AppText
                variant='h2'
                style={{
                  fontSize: layout.titleFontSize,
                }}
              >
                {strings?.changePassword?.successTitle || 'Password changed!'}
              </AppText>

              <AppText
                variant='body'
                color={colors.textSecondary}
                className='text-center'
                style={{
                  marginTop: layout.tightGap,
                }}
              >
                {strings?.changePassword?.successSubtitle ||
                  'Your password has been successfully changed.'}
              </AppText>
            </View>

            <View
              style={{
                marginTop: layout.sectionGap,
              }}
            >
              <PrimaryButton
                title={strings?.changePassword?.backButton || 'Back'}
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

export default ChangePassword;
