import React, { useRef, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import VerifyEmailIcon from '../assets/svg/verifyEmailIcon';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';
import { Radius } from '../constants/Radius';

const VerifyEmailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every(item => item !== '');
  const boxSize = moderateScale(48);

  return (
    <Screen scroll>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp(4),
          paddingVertical: hp(2),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: wp(3),
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="title">Verify Email</AppText>
      </View>

      {/* Body */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: wp(6),
          paddingTop: hp(5),
          alignItems: 'center',
          gap: hp(3),
        }}>

        {/* Icon */}
        <View
          style={{
            width: moderateScale(80),
            height: moderateScale(80),
            borderRadius: 999,
            backgroundColor: '#DEEBFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <VerifyEmailIcon width={moderateScale(36)} height={moderateScale(36)} />
        </View>

        {/* Title */}
        <View style={{ alignItems: 'center', gap: hp(1) }}>
          <AppText variant="h3">Check your email</AppText>
          <AppText variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            We've sent a{' '}
            <AppText variant="body">6-digit verification code to{'\n'}</AppText>
            <AppText variant="body">alex.johnson@company.com</AppText>
          </AppText>
        </View>

        {/* OTP inputs */}
        <View style={{ flexDirection: 'row', gap: wp(2) }}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputs.current[index] = ref; }}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              style={{
                width: boxSize,
                height: boxSize,
                borderRadius: Radius.md,
                borderWidth: 2,
                borderColor: digit ? colors.primary : colors.border,
                backgroundColor: digit ? '#DEEBFF' : colors.surface,
                color: digit ? colors.primary : colors.text,
                fontSize: moderateScale(20),
                fontWeight: 'bold',
              }}
            />
          ))}
        </View>

        {/* Verify Button */}
        <PrimaryButton
          title="Verify Email"
          disabled={!isComplete}
          onPress={() => {}}
          style={{ width: '100%' }}
        />

        {/* Resend */}
        <View style={{ alignItems: 'center', gap: hp(1) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="caption" color={colors.textSecondary}>
              Didn't receive the code?
            </AppText>
            <TouchableOpacity activeOpacity={0.8}>
              <AppText variant="caption" color={colors.primary}> Resend</AppText>
            </TouchableOpacity>
          </View>
          <AppText variant="caption" color={colors.placeholder}>
            Resend available in 0:57
          </AppText>
        </View>
      </View>
    </Screen>
  );
};

export default VerifyEmailScreen;
