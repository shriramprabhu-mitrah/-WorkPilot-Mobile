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
import { useAppDispatch } from '../store';
import { signInUser } from '../store/auth_store/action/auth.thunks';
import Ionicons from '@react-native-vector-icons/ionicons';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading] = useState(false);

  const validate = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    let isValid = true;

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const onLogin = async () => {
    if (!validate()) {
      return;
    }

    const result = dispatch(
      signInUser({
        payload: {
          email,
          password,
        },
      }),
    );
  };

  return (
    <Screen scroll={true}>
      <AuthLogoHeader />
      <View
        style={{
          flex: 1,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          gap: layout.largeSectionGap,
        }}
      >
        <View style={{ gap: layout.tightGap, marginBottom: layout.sectionGap }}>
          <AppText variant='h2' style={{ fontSize: layout.titleFontSize }}>
            {strings.auth.loginTitle}
          </AppText>
          <AppText variant='body' color={colors.textSecondary}>
            {strings.auth.loginSubtitle}
          </AppText>
        </View>
        <View style={{ gap: layout.sectionGap }}>
          <AppInput
            label={strings.auth.email}
            placeholder={strings.auth.emailPlaceholder}
            keyboardType='email-address'
            autoCapitalize='none'
            value={email}
            error={errors.email}
            leftIcon={
              <Ionicons
                name='mail-outline'
                size={20}
                color={colors.textSecondary}
              />
            }
            onChangeText={text => {
              setEmail(text);
              setErrors(prev => ({
                ...prev,
                email: '',
              }));
            }}
          />
          <PasswordInput
            label='Password'
            placeholder='Enter your password'
            value={password}
            error={errors.password}
            leftIcon={
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color={colors.textSecondary}
              />
            }
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({
                ...prev,
                password: '',
              }));
            }}
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
            <AppText variant='body' color={colors.primary}>
              Forgot Password?
            </AppText>
          </TouchableOpacity>
        </View>
        <View style={{ gap: layout.largeSectionGap }}>
          <PrimaryButton
            title={strings.auth.login}
            loading={loading}
            // onPress={onLogin}
            onPress={() => navigation.navigate('HomeTabs')}
          />
          <AuthFooter
            title="Don't have an account?"
            actionText='Sign up'
            onPress={() => navigation.navigate('signUp')}
          />
        </View>
      </View>
    </Screen>
  );
};

export default LoginScreen;
