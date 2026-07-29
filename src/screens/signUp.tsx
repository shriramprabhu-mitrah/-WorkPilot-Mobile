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
import { useAuthLayout } from '../hooks/useAuthLayout';

const SignUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <Screen scroll={true}>
      <AuthLogoHeader
        title="Create your account"
        content="Join millions of teams on Jira"
      />
      <View
        className="flex-1"
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          gap: layout.elementGap,
        }}
      >
        <View className="z-10" style={{ gap: layout.elementGap }}>
          <View style={{ gap: layout.tightGap }}>
            <AppText
              variant="h2"
              style={{ fontSize: layout.titleFontSize }}
            >
              {strings?.signUp?.headerTitle}
            </AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
            >
              {strings?.signUp?.headerSubtitle}
            </AppText>
          </View>
          <View style={{ gap: layout.sectionGap }}>
            <AppInput
              label={strings?.signUp?.fullNameLabel}
              placeholder={strings?.signUp?.fullNamePlaceholder}
              value={fullName}
              onChangeText={setFullName}
            />
            <AppInput
              label={strings?.signUp?.workEmailLabel}
              placeholder={strings?.signUp?.workEmailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <View className="relative z-20">
              <PasswordRules password={password} />
              <PasswordInput
                label={strings?.signUp?.passwordLabel}
                placeholder={strings?.signUp?.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>
        </View>
        <View
          className="flex-row items-start z-0"
          style={{
            paddingTop: layout.elementGap,
            paddingBottom: layout.largeSectionGap,
            gap: moderateScale(10),
            marginBottom: layout.sectionGap,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            className="items-center justify-center"
            style={{
              width: layout.controlSize,
              height: layout.controlSize,
              borderRadius: moderateScale(5),
              backgroundColor: agreed ? colors.primary : 'transparent',
              borderWidth: agreed ? 0 : moderateScale(2),
              borderColor: colors.border,
            }}
          >
            {agreed && (
              <Ionicons
                name="checkmark"
                size={moderateScale(13)}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
          <AppText
            variant="body"
            color={colors.textSecondary}
            className="flex-1"
          >
            {strings?.signUp?.termsPrefix}{' '}
            <AppText variant="body" color={colors.primary}>
              {strings?.signUp?.customerAgreement}
            </AppText>{' '}
            {strings?.signUp?.termsMiddle}{' '}
            <AppText variant="body" color={colors.primary}>
              {strings?.signUp?.privacyPolicy}
            </AppText>
          </AppText>
        </View>
        <View className="z-0" style={{ gap: layout.sectionGap }}>
          <PrimaryButton
            title={strings?.signUp?.signUpButton}
            disabled={!agreed}
            onPress={() => navigation.navigate('verifyEmail')}
          />
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