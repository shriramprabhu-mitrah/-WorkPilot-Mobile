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
import { API_URL } from '../utils/utils';
import { useAppDispatch } from '../store';
import { signUpUser } from '../store/auth_store/action/auth.thunks';

const SignUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
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

  const validate = () => {
    const newErrors = {
      fullName: '',
      username: '',
      email: '',
      password: '',
    };

    let isValid = true;

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
      isValid = false;
    }

    // Username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      newErrors.username =
        'Username must be 3-20 characters and contain only letters, numbers, or _';
      isValid = false;
    }

    // Email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }

    // Password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

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

      navigation.navigate('verifyEmail');
    } catch (error) {
      console.error(error);
    }
  };

  console.log('Hello', API_URL);

  return (
    <Screen scroll={true}>
      <AuthLogoHeader />
      <View
        className='flex-1'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          gap: layout.elementGap,
        }}
      >
        <View className='z-10' style={{ gap: layout.elementGap }}>
          {/* <View style={{ gap: layout.tightGap }}>
            <AppText variant='h2' style={{ fontSize: layout.titleFontSize }}>
              {strings?.signUp?.headerTitle}
            </AppText>
            <AppText variant='body' color={colors.textSecondary}>
              {strings?.signUp?.headerSubtitle}
            </AppText>
          </View> */}
          <View style={{ gap: layout.sectionGap }}>
            <AppInput
              label={strings?.signUp?.fullNameLabel}
              placeholder={strings?.signUp?.fullNamePlaceholder}
              leftIcon={
                <Ionicons
                  name='person-outline'
                  size={20}
                  color={colors.textSecondary}
                />
              }
              value={fullName}
              error={errors.fullName}
              onChangeText={text => {
                setFullName(text);
                setErrors(prev => ({
                  ...prev,
                  fullName: '',
                }));
              }}
            />

            <AppInput
              label={strings?.signUp?.userNameLabel}
              placeholder={strings?.signUp?.userNamePlaceholder}
              leftIcon={
                <Ionicons
                  name='at-outline'
                  size={20}
                  color={colors.textSecondary}
                />
              }
              value={username}
              error={errors.username}
              onChangeText={text => {
                setUsername(text);
                setErrors(prev => ({
                  ...prev,
                  username: '',
                }));
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
                  size={20}
                  color={colors.textSecondary}
                />
              }
              value={email}
              error={errors.email}
              onChangeText={text => {
                setEmail(text);
                setErrors(prev => ({
                  ...prev,
                  email: '',
                }));
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
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                value={password}
                error={errors.password}
                onChangeText={text => {
                  setPassword(text);
                  setErrors(prev => ({
                    ...prev,
                    password: '',
                  }));
                }}
              />
            </View>
          </View>
        </View>
        <View
          className='z-0 flex-row items-start'
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
            className='items-center justify-center'
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
                name='checkmark'
                size={moderateScale(13)}
                color='#FFFFFF'
              />
            )}
          </TouchableOpacity>
          <AppText
            variant='body'
            color={colors.textSecondary}
            className='flex-1'
          >
            {strings?.signUp?.termsPrefix}{' '}
            <AppText variant='body' color={colors.primary}>
              {strings?.signUp?.customerAgreement}
            </AppText>{' '}
            {strings?.signUp?.termsMiddle}{' '}
            <AppText variant='body' color={colors.primary}>
              {strings?.signUp?.privacyPolicy}
            </AppText>
          </AppText>
        </View>
        <View className='z-0' style={{ gap: layout.sectionGap }}>
          <PrimaryButton
            title={strings?.signUp?.signUpButton}
            disabled={!agreed}
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
