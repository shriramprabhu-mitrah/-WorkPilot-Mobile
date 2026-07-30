import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/Input/AppInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import TickIcon from '../assets/svg/tickIcon';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { mmkv, useAppDispatch } from '../store';
import {
  passwordResetConfirm,
  passwordResetRequest,
  resendEmailVerification,
} from '../store/auth_store/action/auth.thunks';
import { showErrorToast, showSuccessToast } from '../utils/utils';
import { AuthFooter, PasswordInput } from '../components';
import { useResponsive } from '../utils/responsive';

const ForgotPassword = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const { hp } = useResponsive();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resetLoading, setResetLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const hiddenInputRef = useRef<TextInput | null>(null);
  const boxSize = moderateScale(44);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showErrorToast('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        passwordResetRequest({
          email: email.trim(),
        }),
      ).unwrap();

      // Store email for next screens if required
      mmkv.set('resetPasswordEmail', email.trim());

      showSuccessToast('Password reset email sent successfully', 'success');

      setSent(true);
      setCountdown(30);
    } catch (error: any) {
      console.log('LINE88', error);

      showErrorToast(error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      showErrorToast('Please enter a valid OTP');
      return;
    }

    if (!newPassword.trim()) {
      showErrorToast('Please enter a new password');
      return;
    }

    setResetLoading(true);

    try {
      await dispatch(
        passwordResetConfirm({
          email,
          otp,
          new_password: newPassword,
        }),
      ).unwrap();

      showSuccessToast('Password reset successfully', 'success');

      mmkv.remove('resetPasswordEmail');

      navigation.replace('login');
    } catch (error: any) {
      showErrorToast(
        error?.error?.message || error?.message || 'Failed to reset password',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendLoading || countdown > 0) {
      return;
    }

    setResendLoading(true);

    try {
      await dispatch(
        passwordResetRequest({
          email,
        }),
      ).unwrap();

      showSuccessToast('Password reset OTP sent successfully', 'sucsess');

      setOtp('');
      setCountdown(30);
    } catch (error: any) {
      console.log('LINE149', error);

      showErrorToast(
        error?.error?.message || error?.message || 'Failed to resend OTP',
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanText);
  };

  return (
    <Screen scroll={false}>
      <View
        className='flex-row items-center border-b'
        style={{
          borderBottomColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
          gap: wp(3),
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Ionicons
            name='arrow-back'
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant='title'>{strings.forgotPassword.headerTitle}</AppText>
      </View>
      <View
        className='flex-1'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        {!sent ? (
          <View className='flex-1 justify-between'>
            <View style={{ gap: layout.sectionGap }}>
              <View
                className='items-center justify-center'
                style={{
                  width: moderateScale(56),
                  height: moderateScale(56),
                  borderRadius: Radius.xl,
                  backgroundColor: '#DEEBFF',
                }}
              >
                <Ionicons
                  name='mail-outline'
                  size={moderateScale(28)}
                  color={colors.primary}
                />
              </View>
              <View style={{ gap: layout.tightGap }}>
                <AppText
                  variant='h2'
                  style={{ fontSize: layout.titleFontSize }}
                >
                  {strings.forgotPassword.headerSubtitle}
                </AppText>
                <AppText variant='body' color={colors.textSecondary}>
                  {strings.forgotPassword.subtitle}
                </AppText>
              </View>
              <AppInput
                label={strings.forgotPassword.emailLabel}
                placeholder={strings.forgotPassword.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
              <View
                style={{
                  gap: layout.elementGap,
                  marginTop: layout.largeSectionGap,
                }}
              >
                <PrimaryButton
                  title={
                    loading
                      ? 'Sending...'
                      : `${strings.forgotPassword.sendOtpButton}`
                  }
                  onPress={handleSubmit}
                  disabled={loading || !email}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate('login')}
                  className='items-center'
                >
                  <AppText variant='body' color={colors.textSecondary}>
                    {strings.forgotPassword.footerAction}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className='flex-1 justify-between'>
            <View style={{ gap: layout.sectionGap }}>
              <View
                className='items-center justify-center'
                style={{
                  width: moderateScale(56),
                  height: moderateScale(56),
                  borderRadius: Radius.xl,
                  backgroundColor: '#DEEBFF',
                }}
              >
                <TickIcon
                  width={moderateScale(30)}
                  height={moderateScale(30)}
                />
              </View>

              <View style={{ gap: layout.tightGap }}>
                <AppText
                  variant='h2'
                  style={{ fontSize: layout.titleFontSize }}
                >
                  Reset Password
                </AppText>

                <AppText variant='body' color={colors.textSecondary}>
                  Enter the verification code sent to
                </AppText>

                <AppText variant='body'>{email}</AppText>
              </View>

              <View>
                <AppText variant='body' style={{ marginBottom: hp(1) }}>
                  Verification Code
                </AppText>

                <Pressable
                  onPress={() => hiddenInputRef.current?.focus()}
                  className='relative flex-row items-center justify-center'
                  style={{ gap: wp(2) }}
                >
                  <TextInput
                    ref={hiddenInputRef}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType='number-pad'
                    maxLength={6}
                    autoFocus
                    caretHidden
                    textContentType='oneTimeCode'
                    autoComplete='sms-otp'
                    importantForAutofill='yes'
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      zIndex: 10,
                    }}
                  />

                  {[0, 1, 2, 3, 4, 5].map(index => {
                    const digit = otp[index] || '';

                    const isFocused =
                      otp.length === index || (otp.length === 6 && index === 5);

                    return (
                      <View
                        key={index}
                        className='items-center justify-center'
                        style={{
                          width: boxSize,
                          height: boxSize,
                          borderRadius: Radius.md,
                          borderWidth: 2,
                          borderColor: digit
                            ? colors.primary
                            : isFocused
                              ? colors.primary
                              : colors.border,
                          backgroundColor: digit ? '#DEEBFF' : colors.surface,
                        }}
                      >
                        <AppText
                          style={{
                            fontSize: moderateScale(18),
                            fontWeight: 'bold',
                            color: digit ? colors.primary : colors.text,
                          }}
                        >
                          {digit}
                        </AppText>
                      </View>
                    );
                  })}
                </Pressable>
              </View>

              <PasswordInput
                label='New Password'
                placeholder='Enter your new password'
                value={newPassword}
                leftIcon={
                  <Ionicons
                    name='lock-closed-outline'
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                onChangeText={setNewPassword}
              />
            </View>

            <View style={{ gap: layout.elementGap }}>
              <PrimaryButton
                title={resetLoading ? 'Resetting...' : 'Reset Password'}
                loading={resetLoading}
                disabled={otp.length !== 6 || !newPassword || resetLoading}
                onPress={handleResetPassword}
              />

              {countdown > 0 ? (
                <AppText
                  variant='body'
                  color={colors.placeholder}
                  className='text-center'
                >
                  Resend code in {countdown}s
                </AppText>
              ) : (
                <AuthFooter
                  title="Didn't receive the code?"
                  actionText={resendLoading ? 'Sending...' : 'Resend'}
                  onPress={handleResend}
                  disabled={resendLoading}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ForgotPassword;
