import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/Input/AppInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import TickIcon from '../assets/svg/tickIcon';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';

const ForgotPassword = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000)).finally(() =>
      setLoading(false)
    );
    setSent(true);
  };

  const handleResend = () => {
    setSent(false);
    setEmail('');
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
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant="title">{strings.forgotPassword.headerTitle}</AppText>
      </View>
      <View
        className="flex-1"
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        {!sent ? (
          <View className="flex-1 justify-between">
            <View style={{ gap: layout.sectionGap }}>
              <View
                className="items-center justify-center"
                style={{
                  width: moderateScale(56),
                  height: moderateScale(56),
                  borderRadius: Radius.xl,
                  backgroundColor: '#DEEBFF',
                }}
              >
                <Ionicons
                  name="mail-outline"
                  size={moderateScale(28)}
                  color={colors.primary}
                />
              </View>
              <View style={{ gap: layout.tightGap }}>
                <AppText
                  variant="h2"
                  style={{ fontSize: layout.titleFontSize }}
                >
                  {strings.forgotPassword.headerSubtitle}
                </AppText>
                <AppText variant="body" color={colors.textSecondary}>
                  {strings.forgotPassword.subtitle}
                </AppText>
              </View>
              <AppInput
                label={strings.forgotPassword.emailLabel}
                placeholder={strings.forgotPassword.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            <View style={{ gap: layout.elementGap, marginTop: layout.largeSectionGap }}>
              <PrimaryButton
                title={loading ? 'Sending...' : `${strings.forgotPassword.sendButtonLabel}`}
                onPress={handleSubmit}
                disabled={loading || !email}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('login')}
                className="items-center"
              >
                <AppText variant="body" color={colors.textSecondary}>
                  {strings.forgotPassword.footerAction}
                </AppText>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center gap-5">
            <View className="items-center">
              <View
                className="items-center justify-center gap-2"
                style={{
                  width: moderateScale(72),
                  height: moderateScale(72),
                  borderRadius: 999,
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
               {strings.forgotPassword.resetTitle}
              </AppText>
              <AppText
                variant="body"
                color={colors.textSecondary}
                style={{ marginTop: layout.tightGap }}
              >
                {strings.forgotPassword.resetSubtitle}
              </AppText>
              <AppText
                variant="body"
                className="font-semibold"
                style={{ marginTop: layout.tightGap }}
              >
                {email || 'your email'}
              </AppText>
            </View>
            <View style={{ gap: layout.sectionGap }}>
              <PrimaryButton
                title="Open reset link"
                onPress={() => navigation.navigate('resetPassword')}
              />
              <View
                className="flex-row items-center justify-center"
                style={{ gap: wp(1.5) }}
              >
                <AppText variant="body" color={colors.textSecondary}>
                 {strings.forgotPassword.resetFooterLabel}
                </AppText>
                <TouchableOpacity onPress={handleResend}>
                  <AppText variant="body" color={colors.primary}>
                    {strings.forgotPassword.resetFooterAction}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ForgotPassword;