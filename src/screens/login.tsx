import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthLogoHeader from '../components/AuthLogoHeader';
import AppText from '../components/common/AppText';
import Screen from '../components/common/ScreenWapper';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import { signInUser } from '../store/auth_store/action/auth.thunks';
import Ionicons from '@react-native-vector-icons/ionicons';
import { handleLoading } from '../store/auth_store/reducer/auth.reducer';
import { showSnackbar } from '../components/common/Snackbar';
import AppInput from '../components/common/Input/AppInput';
import PasswordInput from '../components/common/Input/PasswordInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { loading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validate = () => {
    const newErrors = {
      email: '',
      password: '',
    };
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      setErrors(newErrors);
      return false;
    }
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
      setErrors(newErrors);
      return false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      setErrors(newErrors);
      return false;
    }
    setErrors({
      email: '',
      password: '',
    });
    return true;
  };

  const onLogin = async () => {
    if (!validate()) {
      return;
    }
    dispatch(handleLoading(true));
    try {
      await dispatch(
        signInUser({
          payload: {
            email,
            password,
          },
        }),
      ).unwrap();

      showSnackbar({
        message: 'Login success!',
        type: 'success',
      });
    } catch (error: any) {
      showSnackbar({
        message: typeof error === 'string' ? error : 'Login failed',
        type: 'error',
      });
    }
  };

  return (
    <Screen scroll={true}>
      <View style={{ flexGrow: 1, backgroundColor: '#FFFFFF' }}>
        {/* Top Hero Header with Rocket/Plane SVG, Office Image & Brand */}
        <AuthLogoHeader />

        {/* Main Floating Card Section */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: moderateScale(24),
            paddingTop: moderateScale(4),
            paddingBottom: hp(4),
            justifyContent: 'space-between',
          }}
        >
          <View>
            {/* Header: Welcome Back with Hand Wave Emoji */}
            <View
              style={{
                gap: layout.tightGap,
                marginBottom: isSmallHeight
                  ? layout.largeSectionGap
                  : layout.sectionGap,
              }}
            >
              <AppText
                variant='h1'
                style={{
                  fontSize: isSmallHeight
                    ? moderateScale(18)
                    : layout.titleFontSize,
                  fontWeight: '800',
                }}
              >
                {strings.auth.loginTitle}
              </AppText>
              <AppText
                variant='body'
                color={colors.textSecondary}
                style={{
                  fontSize: isSmallHeight
                    ? moderateScale(11)
                    : moderateScale(12),
                }}
              >
                {strings.auth.loginSubtitle}
              </AppText>
            </View>

            {/* Form Inputs Container */}
            <View style={{ gap: moderateScale(14) }}>
              {/* Email Input */}
              <AppInput
                label='Email'
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder='Enter your email'
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                error={errors.email}
                leftIcon={
                  <Ionicons
                    name='mail-outline'
                    size={moderateScale(19)}
                    color={emailFocused ? '#2563EB' : '#94A3B8'}
                  />
                }
                style={{
                  fontSize: moderateScale(13.5),
                  color: '#0F172A',
                }}
              />

              {/* Password Input */}
              <PasswordInput
                label='Password'
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder='Enter your password'
                error={errors.password}
                leftIcon={
                  <Ionicons
                    name='lock-closed-outline'
                    size={moderateScale(19)}
                    color={passwordFocused ? '#2563EB' : '#94A3B8'}
                  />
                }
                style={{
                  fontSize: moderateScale(13.5),
                  color: '#0F172A',
                }}
              />

              {/* Remember Me and Forgot Password Row */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  alignSelf: 'flex-end',
                  paddingTop: layout.tightGap,
                }}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <AppText variant='body' color={colors.primary}>
                  Forgot Password?
                </AppText>
              </TouchableOpacity>

              {/* Log In Button */}
              <PrimaryButton
                title='Log In'
                onPress={onLogin}
                loading={loading}
                disabled={loading}
                style={{
                  backgroundColor: '#1D64F2',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: moderateScale(6),
                  shadowColor: '#1D64F2',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textColor='#FFFFFF'
              />

              {/* Don't have an account? Sign up */}
              <View
                className='flex-row items-center justify-center'
                style={{
                  marginVertical: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(12.5),
                    color: '#64748B',
                  }}
                >
                  Don't have an account?{' '}
                </AppText>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('signUp')}
                >
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(12.5),
                      color: '#1D64F2',
                      fontWeight: '700',
                    }}
                  >
                    Sign up
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default LoginScreen;
