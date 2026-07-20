import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AuthLogoHeader from '../components/AuthLogoHeader';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/Input/AppInput';
import PasswordInput from '../components/common/Input/PasswordInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import AuthFooter from '../components/common/AuthFooter';
import PasswordRules from '../components/passwordRules';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const SignUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { hp, wp } = useResponsive();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <Screen scroll>
      <AuthLogoHeader
        title="Create your account"
        content="Join millions of teams on Jira"
      />
      <View style={{ paddingHorizontal: wp(6), paddingVertical: hp(3) }}>
        {/* Heading */}
        <View style={{ marginBottom: hp(3) }}>
          <AppText variant="h2">
            {strings?.signUp?.headerTitle}
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            style={{ marginTop: hp(1) }}>
            {strings?.signUp?.headerSubtitle}
          </AppText>
        </View>

        {/* Full Name */}
        <AppInput
          label={strings?.signUp?.fullNameLabel}
          placeholder={strings?.signUp?.fullNamePlaceholder}
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <View style={{ marginTop: hp(2) }}>
          <AppInput
            label={strings?.signUp?.workEmailLabel}
            placeholder={strings?.signUp?.workEmailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View style={{ marginTop: hp(2) }}>
          <PasswordInput
            label={strings?.signUp?.passwordLabel}
            placeholder={strings?.signUp?.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <PasswordRules password={password} />

        {/* Terms & Conditions */}
        <View style={{ marginTop: hp(3), flexDirection: 'row', alignItems: 'flex-start' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            style={{
              width: wp(6),
              height: wp(6),
              borderRadius: 6,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: agreed ? colors.primary : 'transparent',
              borderWidth: agreed ? 0 : 2,
              borderColor: colors.border,
            }}>
            {agreed && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <AppText
            variant="body"
            style={{ flex: 1, marginLeft: wp(3) }}
            color={colors.textSecondary}>
            {strings?.signUp?.termsPrefix}{' '}
            <AppText variant="body" color={colors.primary}>
              {strings?.signUp?.customerAgreement}
            </AppText>
            {' '}{strings?.signUp?.termsMiddle}{' '}
            <AppText variant="body" color={colors.primary}>
              {strings?.signUp?.privacyPolicy}
            </AppText>
          </AppText>
        </View>

        <PrimaryButton
          title={strings?.signUp?.signUpButton}
          disabled={!agreed}
          style={{ marginTop: hp(3) }}
          onPress={() => navigation.navigate('verifyEmail')}
        />

        <View style={{ marginTop: hp(3) }}>
          <AuthFooter
            title={strings?.signUp?.footerTitle}
            actionText={strings?.signUp?.footerAction}
            onPress={() => navigation.navigate('login')}
          />
        </View>
      </View>
    </Screen>
  );
};

export default SignUpScreen;
