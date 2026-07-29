import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import VerifyEmailIcon from '../assets/svg/verifyEmailIcon';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { AuthFooter } from '../components';
import { mmkv, useAppDispatch } from '../store';
import {
  emailVerification,
  resendEmailVerification,
} from '../store/auth_store/action/auth.thunks';
import { showErrorToast, showSuccessToast } from '../utils/utils';

const VerifyEmailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const [code, setCode] = useState('');
  const hiddenInputRef = useRef<TextInput | null>(null);
  const isComplete = code.length === 6;
  const boxSize = moderateScale(44);
  const email = mmkv.getString('verificationEmail');

  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);

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

  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(cleanText);
  };

  const onVerifyEmail = async () => {
    if (code.length !== 6) {
      return;
    }

    if (!email) {
      showErrorToast('Email not found. Please register again.');
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        emailVerification({
          email,
          otp: code,
        }),
      ).unwrap();

      showSuccessToast('Email verified successfully');

      // Remove the stored email after successful verification
      mmkv.remove('verificationEmail');

      navigation.replace('login');
    } catch (error: any) {
      showErrorToast(
        error?.error?.message || error?.message || 'Email verification failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const onResendEmail = async () => {
    if (!email || resendLoading || countdown > 0) {
      return;
    }

    setResendLoading(true);

    try {
      await dispatch(
        resendEmailVerification({
          email,
        }),
      ).unwrap();

      showSuccessToast('Verification code sent successfully');

      setCountdown(30);
    } catch (error: any) {
      showErrorToast(
        error?.error?.message ||
          error?.message ||
          'Failed to resend verification code',
      );
    } finally {
      setResendLoading(false);
    }
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='arrow-back'
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant='title'>
          {strings?.verifyEmail?.headerTitle || 'Verify Email'}
        </AppText>
      </View>
      <View
        className='flex-1 gap-5'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        <View className='items-center' style={{ gap: layout.sectionGap }}>
          <View
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(72),
              height: moderateScale(72),
              backgroundColor: '#DEEBFF',
            }}
          >
            <VerifyEmailIcon
              width={moderateScale(34)}
              height={moderateScale(34)}
            />
          </View>
          <View className='items-center' style={{ gap: layout.elementGap }}>
            <AppText variant='h2' style={{ fontSize: layout.titleFontSize }}>
              {strings?.verifyEmail?.title || 'Check your email'}
            </AppText>
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='text-center'
            >
              {strings?.verifyEmail?.subtitle ||
                "We've sent a 6-digit verification code to"}
              {'\n'}
              <AppText variant='body' color={colors.text}>
                {email ?? ''}
              </AppText>
            </AppText>
          </View>
          <Pressable
            onPress={() => hiddenInputRef.current?.focus()}
            className='relative flex-row items-center justify-center'
            style={{ gap: wp(2) }}
          >
            <TextInput
              ref={hiddenInputRef}
              value={code}
              onChangeText={handleTextChange}
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
              const digit = code[index] || '';
              const isFocused =
                code.length === index || (code.length === 6 && index === 5);

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
        <View style={{ gap: layout.elementGap, marginTop: layout.sectionGap }}>
          <PrimaryButton
            title={strings?.verifyEmail?.verifyButton || 'Verify Email'}
            disabled={!isComplete || loading}
            loading={loading}
            onPress={onVerifyEmail}
          />
          <View className='items-center' style={{ gap: layout.tightGap }}>
            {countdown > 0 ? (
              <AppText variant='body' color={colors.placeholder}>
                Resend code in {countdown}s
              </AppText>
            ) : (
              <AuthFooter
                title="Didn't receive the code?"
                actionText={resendLoading ? 'Sending...' : 'Resend'}
                onPress={onResendEmail}
                disabled={resendLoading}
              />
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default VerifyEmailScreen;
