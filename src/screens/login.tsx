import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthLogoHeader from '../components/AuthLogoHeader';
import AppText from '../components/common/AppText';
import { AppInput, PasswordInput } from '../components/common/Input';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import Divider from '../components/common/divider';
import AuthFooter from '../components/common/AuthFooter';
import GoogleIcon from '../assets/svg/GoogleIcon';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import Screen from '../components/common/ScreenWapper';
import SocialButton from '../components/common/Button/SocialButton';
import { useResponsive } from '../utils/responsive';

const LoginScreen = () => {

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const { colors, strings } = useTheme();

  const {
    wp,
    moderateScale,
    fontScale
  } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading] = useState(false);


  const onLogin = () => {
    navigation.navigate('HomeTabs');
  };


  return (
    <Screen>
      <View style={{ flex:1 }}>
        <AuthLogoHeader
          title="Jira Cloud"
          content="by Atlassian"
        />
        <View
          style={{
            paddingHorizontal:wp(6),
            paddingTop:moderateScale(10),
            paddingBottom:moderateScale(10),
            justifyContent:'center',
          }}
        >
          <View
            style={{
              gap:moderateScale(15)
            }}
          >
            <View
              style={{
                gap:moderateScale(4)
              }}
            >
              <AppText
                variant="h2"
                style={{
                  fontSize:fontScale(22)
                }}
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
            <View
              style={{
                gap:moderateScale(14)
              }}
            >
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
            </View>
          </View>
          <TouchableOpacity
              activeOpacity={0.8}
              style={{
                alignSelf:'flex-end',
                paddingTop:moderateScale(10),
                paddingBottom: moderateScale(20)
              }}
              onPress={() =>
                navigation.navigate('ForgotPassword')
              }
            >
              <AppText
                variant="body"
                color={colors.primary}
              >
                Forgot Password?
              </AppText>

            </TouchableOpacity>
          <View
            style={{
              gap:moderateScale(16),
              paddingBottom:moderateScale(8)
            }}
          >
            <PrimaryButton
              title={strings.auth.login}
              loading={loading}
              onPress={onLogin}
            />
            <Divider
              title="or continue with"
            />
            <SocialButton
              title="Continue with Google"
              icon={<GoogleIcon />}
              onPress={() => {}}
            />
            <AuthFooter
              title="Don't have an account?"
              actionText="Sign up"
              onPress={() =>
                navigation.navigate('signUp')
              }
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default LoginScreen;