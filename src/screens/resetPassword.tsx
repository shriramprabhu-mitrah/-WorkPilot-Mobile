import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PasswordInput from '../components/common/Input/PasswordInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import TickIcon from '../assets/svg/tickIcon';
import PasswordRules from '../components/passwordRules';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { validatePasswordReset } from '../utils/validations';

const ResetPassword = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const { matches, valid } = validatePasswordReset(password, confirm);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1200);
  };

  return (
    <Screen scroll={false}>
      <View
        className="flex-row items-center border-b"
        style={{
          borderBottomColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
          gap: wp(3),
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant="title">{strings.resetPassword.headerTitle}</AppText>
      </View>
      <View
        className="flex-1"
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        {!done ? (
          <View className="flex-1 gap-5">
            <View style={{ gap: layout.sectionGap }}>
              <View style={{ gap: layout.tightGap }}>
                <AppText
                  variant="h2"
                  style={{ fontSize: layout.titleFontSize }}
                >
                  {strings.resetPassword.subtitle}
                </AppText>
                <AppText variant="body" color={colors.textSecondary}>
                  {strings.resetPassword.description}
                </AppText>
              </View>
              <View style={{ gap: layout.sectionGap }}>
                <View className="relative z-20">
                  <PasswordInput
                    label={strings.resetPassword.newPasswordLabel}
                    placeholder={strings.resetPassword.newPasswordPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <PasswordRules password={password} />
                </View>
                <View className="z-10">
                  <PasswordInput
                    label={strings.resetPassword.confirmPasswordLabel}
                    placeholder={strings.resetPassword.confirmPasswordPlaceholder}
                    value={confirm}
                    onChangeText={setConfirm}
                  />
                  {confirm.length > 0 && !matches && (
                    <AppText
                      variant="caption"
                      color={colors.error}
                      style={{ marginTop: layout.tightGap }}
                    >
                      {strings.resetPassword.validationLabel}
                    </AppText>
                  )}
                </View>
              </View>
            </View>
            <View style={{ marginTop: layout.sectionGap }}>
              <PrimaryButton
                title={loading ? 'Resetting...' : 'Reset password'}
                onPress={handleReset}
                disabled={loading || !valid}
              />
            </View>
          </View>
        ) : (
          <View className="flex-1 gap-5 justify-center">
            <View className="items-center">
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: moderateScale(72),
                  height: moderateScale(72),
                  backgroundColor: '#E3FCEF',
                  marginBottom: layout.sectionGap,
                }}
              >
                <TickIcon
                  width={moderateScale(36)}
                  height={moderateScale(36)}
                />
              </View>
              <AppText
                variant="h2"
                style={{ fontSize: layout.titleFontSize }}
              >
                {strings.resetPassword.successTitle}
              </AppText>
              <AppText
                variant="body"
                color={colors.textSecondary}
                className="text-center"
                style={{ marginTop: layout.tightGap }}
              >
                {strings.resetPassword.successSubtitle}
              </AppText>
            </View>

            <View style={{ marginTop: layout.sectionGap }}>
              <PrimaryButton
                title={strings.resetPassword.backButton}
                onPress={() => navigation.navigate('login')}
              />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ResetPassword;