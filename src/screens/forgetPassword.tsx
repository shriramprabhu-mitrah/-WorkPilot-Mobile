import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
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
import { useResponsive } from '../utils/responsive';
import { Radius } from '../constants/Radius';

const ForgotPassword = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000)).finally(() => setLoading(false));
    setSent(true);
  };

  const handleResend = () => {
    setSent(false);
    setEmail('');
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
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Ionicons name="arrow-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="title">Forgot password</AppText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: wp(6), paddingTop: hp(4) }}>
        {!sent ? (
          <>
            <View
              style={{
                width: moderateScale(64),
                height: moderateScale(64),
                backgroundColor: '#DEEBFF',
                borderRadius: Radius.xl,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp(3),
              }}>
              <Ionicons name="mail-outline" size={moderateScale(30)} color={colors.primary} />
            </View>

            <AppText variant="h3">Reset your password</AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={{ marginTop: hp(1), marginBottom: hp(3) }}>
              Enter the email address linked to your Atlassian account and we'll send you a reset link.
            </AppText>

            <AppInput
              label="Email address"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PrimaryButton
              title={loading ? 'Sending...' : 'Send reset link'}
              onPress={handleSubmit}
              disabled={loading || !email}
              style={{ marginTop: hp(3) }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('login')}
              style={{ marginTop: hp(2), alignItems: 'center' }}>
              <AppText variant="body" color={colors.textSecondary}>Back to login</AppText>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: hp(2) }}>
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

            <AppText variant="h3">Check your email</AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={{ marginTop: hp(1) }}>
              We've sent a password reset link to
            </AppText>
            <AppText
              variant="body"
              style={{ marginTop: hp(0.5), marginBottom: hp(3) }}>
              {email || 'your email'}
            </AppText>

            <PrimaryButton
              title="Open reset link"
              onPress={() => navigation.navigate('resetPassword')}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(3), gap: wp(2) }}>
              <AppText variant="body" color={colors.textSecondary}>Didn't receive it?</AppText>
              <TouchableOpacity onPress={handleResend}>
                <AppText variant="body" color={colors.primary}>Resend email</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ForgotPassword;
