import React, { ReactNode, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
// Replaced useResponsive with useAuthLayout
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import AppText from '../AppText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

const PasswordInput = ({ label, error, leftIcon, style, ...props }: Props) => {
  const { colors } = useTheme();
  // Destructure required values from useAuthLayout
  const { layout, isSmallHeight, isLargeHeight, hp, verticalScale } =
    useAuthLayout();
  const [secure, setSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Dynamic vertical padding driven by useAuthLayout height tiers (matches AppInput)
  const inputPaddingVertical = isSmallHeight
    ? verticalScale(10)
    : isLargeHeight
      ? verticalScale(16)
      : verticalScale(12);

  return (
    <View>
      {label && (
        <AppText
          variant='body'
          style={{
            // Applied layout bodyFontSize and scaled marginBottom
            marginBottom: hp(0.8),
            fontSize: layout.bodyFontSize,
          }}
        >
          {label}
        </AppText>
      )}
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error
            ? colors.error
            : isFocused
              ? '#0E6FFF'
              : colors.border,
          borderRadius: Radius.md,
          flexDirection: 'row',
          alignItems: 'center',
          // Replaced wp with scaled layout horizontal padding
          paddingHorizontal: layout.paddingHorizontal / 1.5,
        }}
      >
        {leftIcon && (
          <View
            style={{
              // Replaced wp with layout elementGap
              marginRight: layout.elementGap,
            }}
          >
            {leftIcon}
          </View>
        )}
        <TextInput
          {...props}
          secureTextEntry={secure}
          placeholderTextColor={colors.placeholder}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              // Applied dynamic responsive vertical padding
              paddingVertical: inputPaddingVertical,
              // Applied layout bodyFontSize
              fontSize: layout.bodyFontSize,
              color: colors.text,
            },
            style,
          ]}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            // Replaced moderateScale with layout controlSize
            size={layout.controlSize}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {!!error && (
        <AppText
          variant='caption'
          color={colors.error}
          style={{
            // Replaced hp with layout tightGap and applied captionFontSize
            marginTop: layout.tightGap,
            fontSize: layout.captionFontSize,
          }}
        >
          {error}
        </AppText>
      )}
    </View>
  );
};

export default PasswordInput;
