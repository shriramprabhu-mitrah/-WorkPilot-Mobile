import React, { useRef, useState } from 'react';
import { Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import VerifyEmailIcon from '../assets/svg/verifyEmailIcon';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { AuthFooter } from '../components';

const VerifyEmailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const [code, setCode] = useState('');
  const hiddenInputRef = useRef<TextInput | null>(null);
  const isComplete = code.length === 6;
  const boxSize = moderateScale(44);

  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(cleanText);
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
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant="title">
          {strings?.verifyEmail?.headerTitle || 'Verify Email'}
        </AppText>
      </View>
      <View
        className="flex-1 gap-5"
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        <View className="items-center" style={{ gap: layout.sectionGap }}>
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: moderateScale(72),
              height: moderateScale(72),
              backgroundColor: '#DEEBFF',
            }}
          >
            <VerifyEmailIcon
              width={moderateScale(34)}
              height={moderateScale(34)}
            />
          </View>
          <View className="items-center" style={{ gap: layout.elementGap }}>
            <AppText
              variant="h2"
              style={{ fontSize: layout.titleFontSize }}
            >
              {strings?.verifyEmail?.title || 'Check your email'}
            </AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              className="text-center"
            >
              {strings?.verifyEmail?.subtitle || "We've sent a 6-digit verification code to"}{'\n'}
              <AppText variant="body" color={colors.text}>
                alex.johnson@company.com
              </AppText>
            </AppText>
          </View>
          <Pressable
            onPress={() => hiddenInputRef.current?.focus()}
            className="relative flex-row justify-center items-center"
            style={{ gap: wp(2) }}
          >
            <TextInput
              ref={hiddenInputRef}
              value={code}
              onChangeText={handleTextChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
              caretHidden={true}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                zIndex: 10,
              }}
            />
            {[0, 1, 2, 3, 4, 5].map(index => {
              const digit = code[index] || '';
              const isFocused = code.length === index || (code.length === 6 && index === 5);

              return (
                <View
                  key={index}
                  className="items-center justify-center"
                  style={{
                    width: boxSize,
                    height: boxSize,
                    borderRadius: Radius.md,
                    borderWidth: 2,
                    borderColor: digit
                      ? colors.primary
                      : isFocused
                      ? colors.primary
                      : colors.border,
                    backgroundColor: digit ? '#DEEBFF' : colors.surface,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: moderateScale(18),
                      fontWeight: 'bold',
                      color: digit ? colors.primary : colors.text,
                    }}
                  >
                    {digit}
                  </AppText>
                </View>
              );
            })}
          </Pressable>
        </View>
        <View style={{ gap: layout.elementGap, marginTop: layout.sectionGap }}>
          <PrimaryButton
            title={strings?.verifyEmail?.verifyButton || 'Verify Email'}
            disabled={!isComplete}
            onPress={() => navigation.navigate('login')}
          />
          <View className="items-center" style={{ gap: layout.tightGap }}>
            <AuthFooter
              title="Didn't receive the code?"
              actionText="Resend"
              onPress={() => navigation.navigate('signUp')}
            />
            <AppText variant="caption" color={colors.placeholder}>
              Resend available in 0:57
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default VerifyEmailScreen;