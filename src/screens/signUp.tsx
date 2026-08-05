import React, { useState } from 'react';
import { TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { API_URL, showErrorToast, showSuccessToast } from '../utils/utils';
import { mmkv, useAppDispatch } from '../store';
import { signUpUser } from '../store/auth_store/action/auth.thunks';
import { useResponsive } from '../utils/responsive';

const SignUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();
  const { height: screenHeight } = useResponsive();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const responsiveOverlap = Math.round(screenHeight * -0.035);
  const cardBorderRadius = moderateScale(24);

  const validate = () => {
    const newErrors = {
      fullName: '',
      username: '',
      email: '',
      password: '',
    };
    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      setErrors(newErrors);
      return false;
    }
    if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
      setErrors(newErrors);
      return false;
    }
    // Username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      setErrors(newErrors);
      return false;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      newErrors.username = '3-20 chars (letters, numbers, _)';
      setErrors(newErrors);
      return false;
    }
    // Email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      setErrors(newErrors);
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Enter a valid email address';
      setErrors(newErrors);
      return false;
    }
    // Password
    if (!password) {
      newErrors.password = 'Password is required';
      setErrors(newErrors);
      return false;
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      setErrors(newErrors);
      return false;
    }
    // Clear all errors
    setErrors({
      fullName: '',
      username: '',
      email: '',
      password: '',
    });
    return true;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await dispatch(
        signUpUser({
          full_name: fullName,
          username,
          email,
          password,
          role: 'super_admin',
          avatar_url: 'https://example.com/avatars/oliver.jpg',
          timezone: 'Asia/Kolkata',
        }),
      ).unwrap();
      mmkv.set('verificationEmail', email);
      showSuccessToast(result.message, 'success');
      navigation.navigate('verifyEmail');
    } catch (error: any) {
      showErrorToast(
        error?.error?.message || error?.message || 'Account creation failed',
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={true}>
      {/* Dynamic Header */}
      <AuthLogoHeader />
      {/* Dynamic Card Container */}
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
          overflow: 'hidden', // Clips internal content to reveal top radius curves
          marginTop: responsiveOverlap, // Negative overlap to pull card over the header
          zIndex: 10,
          elevation: 5, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          flexGrow: 1,
        }}
      >
        {/* Header Title Section */}
        <View>
          <AppText
            variant='h2'
            style={{
              fontSize: isSmallHeight
                ? moderateScale(17)
                : layout.titleFontSize,
            }}
          >
            {strings?.signUp?.headerTitle || 'Create Account'}
          </AppText>
          <AppText
            variant='body'
            color={colors.textSecondary}
            style={{
              fontSize: isSmallHeight ? moderateScale(11) : moderateScale(12),
            }}
          >
            {strings?.signUp?.headerSubtitle ||
              'Sign up to get started with your account.'}
          </AppText>
        </View>

        {/* Input Form Section */}
        <View
          className='z-10'
          style={{ gap: isSmallHeight ? moderateScale(5) : layout.elementGap }}
        >
          <AppInput
            label={strings?.signUp?.fullNameLabel}
            placeholder={strings?.signUp?.fullNamePlaceholder}
            leftIcon={
              <Ionicons
                name='person-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={fullName}
            error={errors.fullName}
            onChangeText={text => {
              setFullName(text);
              setErrors(prev => ({ ...prev, fullName: '' }));
            }}
          />
          <AppInput
            label={strings?.signUp?.userNameLabel}
            placeholder={strings?.signUp?.userNamePlaceholder}
            leftIcon={
              <Ionicons
                name='at-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={username}
            error={errors.username}
            onChangeText={text => {
              setUsername(text);
              setErrors(prev => ({ ...prev, username: '' }));
            }}
          />
          <AppInput
            label={strings?.signUp?.workEmailLabel}
            placeholder={strings?.signUp?.workEmailPlaceholder}
            keyboardType='email-address'
            autoCapitalize='none'
            leftIcon={
              <Ionicons
                name='mail-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={email}
            error={errors.email}
            onChangeText={text => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
          />
          <View className='relative z-20'>
            <PasswordRules password={password} />
            <PasswordInput
              label={strings?.signUp?.passwordLabel}
              placeholder={strings?.signUp?.passwordPlaceholder}
              leftIcon={
                <Ionicons
                  name='lock-closed-outline'
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              }
              value={password}
              error={errors.password}
              onChangeText={text => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
            />
          </View>
        </View>
        {/* Checkbox Section */}
        <View
          className='z-0 flex-row items-center'
          style={{
            gap: moderateScale(8),
            marginVertical: isSmallHeight ? 2 : 4,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            className='items-center justify-center'
            style={{
              width: moderateScale(18),
              height: moderateScale(18),
              borderRadius: moderateScale(4),
              backgroundColor: agreed ? colors.primary : 'transparent',
              borderWidth: agreed ? 0 : moderateScale(1.5),
              borderColor: colors.border,
            }}
          >
            {agreed && (
              <Ionicons
                name='checkmark'
                size={moderateScale(12)}
                color='#FFFFFF'
              />
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <AppText
              variant='body'
              color={colors.textSecondary}
              style={{
                fontSize: isSmallHeight ? moderateScale(10) : moderateScale(11),
              }}
            >
              {strings?.signUp?.termsPrefix}{' '}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Terms')}
            >
              <AppText
                variant='body'
                color={colors.primary}
                style={{
                  fontSize: isSmallHeight
                    ? moderateScale(10)
                    : moderateScale(11),
                  textDecorationLine: 'underline',
                }}
              >
                {strings?.signUp?.customerAgreement}
              </AppText>
            </TouchableOpacity>

            <AppText
              variant='body'
              color={colors.textSecondary}
              style={{
                fontSize: isSmallHeight ? moderateScale(10) : moderateScale(11),
              }}
            >
              {' '}
              {strings?.signUp?.termsMiddle}{' '}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <AppText
                variant='body'
                color={colors.primary}
                style={{
                  fontSize: isSmallHeight
                    ? moderateScale(10)
                    : moderateScale(11),
                  textDecorationLine: 'underline',
                }}
              >
                {strings?.signUp?.privacyPolicy}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
        {/* Footer & Buttons */}
        <View
          className='z-0'
          style={{ gap: isSmallHeight ? moderateScale(8) : layout.elementGap }}
        >
          <PrimaryButton
            title={strings?.signUp?.signUpButton}
            disabled={!agreed}
            loading={loading}
            onPress={handleSignUp}
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
