import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthLogoHeader from '../components/AuthLogoHeader';
import AppText from '../components/common/AppText';
import { AppInput, PasswordInput } from '../components/common/Input';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import Divider from '../components/common/divider';
import AuthFooter from '../components/common/AuthFooter';
import GoogleIcon from '../assets/svg/GoogleIcon';
import Screen from '../components/common/ScreenWapper';
import SocialButton from '../components/common/Button/SocialButton';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading] = useState(false);

  const onLogin = () => {
    navigation.navigate('HomeTabs');
  };

  return (
    <Screen scroll={true}>
      <AuthLogoHeader
        title="Jira Cloud"
        content="by Atlassian"
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          gap: layout.largeSectionGap
        }}
      >
        <View style={{ gap: layout.tightGap, marginBottom: layout.sectionGap }}>
          <AppText
            variant="h2"
            style={{ fontSize: layout.titleFontSize }}
          >
            {strings.auth.loginTitle}
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
          >
            {strings.auth.loginSubtitle}
          </AppText>
        </View>
        <View style={{ gap: layout.sectionGap }}>
          <AppInput
            label={strings.auth.email}
            placeholder={strings.auth.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              alignSelf: 'flex-end',
              paddingTop: layout.tightGap,
              marginBottom: layout.largeSectionGap,
            }}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <AppText
              variant="body"
              color={colors.primary}
            >
              Forgot Password?
            </AppText>
          </TouchableOpacity>
        </View>
        <View style={{ gap: layout.largeSectionGap }}>
          <PrimaryButton
            title={strings.auth.login}
            loading={loading}
            onPress={onLogin}
          />
          <Divider title="or continue with" />
          <View style={{ gap: layout.sectionGap, zIndex: 1 }}>
            <SocialButton
              title="Continue with Google"
              icon={<GoogleIcon />}
              onPress={() => { }}
            />
            <AuthFooter
              title="Don't have an account?"
              actionText="Sign up"
              onPress={() => navigation.navigate('signUp')}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};


export default LoginScreen;