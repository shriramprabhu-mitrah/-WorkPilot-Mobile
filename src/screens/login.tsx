import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthLogoHeader from '../components/AuthLogoHeader';
import AppText from '../components/common/AppText';
import { AppInput, PasswordInput } from '../components/common/Input';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import AuthFooter from '../components/common/AuthFooter';
import Screen from '../components/common/ScreenWapper';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import { signInUser } from '../store/auth_store/action/auth.thunks';
import Ionicons from '@react-native-vector-icons/ionicons';
import { moderateScale, useResponsive } from '../utils/responsive';
import { showSuccessToast } from '../utils/utils';
import { handleLoading } from '../store/auth_store/reducer/auth.reducer';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { loading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { height: screenHeight } = useResponsive();
  const { layout, isSmallHeight } = useAuthLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const responsiveOverlap = Math.round(screenHeight * -0.035);
  const cardBorderRadius = moderateScale(24);

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
    dispatch(
      signInUser({
        payload: {
          email,
          password,
        },
        showSuccessToast,
      }),
    );
  };

  return (
    <Screen scroll={true}>
      <View className='flex-1'>
        {/* Curved Hero Header */}
        <AuthLogoHeader />
        {/* Elevated Floating Card Sheet with Top Wave Curve */}
        <View
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: isSmallHeight
              ? moderateScale(16)
              : layout.paddingTop || moderateScale(24),
            paddingBottom: isSmallHeight
              ? moderateScale(5)
              : layout.paddingBottom || moderateScale(24),
            gap: isSmallHeight ? moderateScale(6) : layout.elementGap,
            borderTopLeftRadius: cardBorderRadius,
            borderTopRightRadius: cardBorderRadius,
            overflow: 'hidden',
            marginTop: responsiveOverlap,
            zIndex: 10,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            flexGrow: 1,
          }}
        >
          {/* Card Title Header */}
          <View
            style={{
              gap: layout.tightGap,
              marginBottom: isSmallHeight
                ? layout.largeSectionGap
                : layout.sectionGap,
            }}
          >
            <AppText
              variant='h2'
              style={{
                fontSize: isSmallHeight
                  ? moderateScale(18)
                  : layout.titleFontSize,
              }}
            >
              {strings.auth.loginTitle}
            </AppText>
            <AppText
              variant='body'
              color={colors.textSecondary}
              style={{
                fontSize: isSmallHeight ? moderateScale(11) : moderateScale(12),
              }}
            >
              {strings.auth.loginSubtitle}
            </AppText>
          </View>

          {/* Form Inputs */}
          <View
            style={{
              gap: isSmallHeight ? layout.largeSectionGap : layout.sectionGap,
              marginBottom: layout.sectionGap,
              marginTop: isSmallHeight
                ? layout.largeSectionGap
                : layout.tightGap,
            }}
          >
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

          {/* Action Buttons */}
          <View style={{ gap: layout.largeSectionGap }}>
            <PrimaryButton
              title={strings.auth.login}
              loading={loading}
              onPress={onLogin}
              // onPress={() => navigation.navigate('HomeTabs')}
            />
            <AuthFooter
              title="Don't have an account?"
              actionText='Sign up'
              onPress={() => navigation.navigate('signUp')}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default LoginScreen;
