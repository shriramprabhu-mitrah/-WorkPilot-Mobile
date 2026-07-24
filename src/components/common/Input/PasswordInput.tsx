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
import { useResponsive } from '../../../utils/responsive';
import AppText from '../AppText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

const PasswordInput = ({ label, error, leftIcon, style, ...props }: Props) => {
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();
  const [secure, setSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      {label && (
        <AppText variant='body' style={{ marginBottom: hp(1) }}>
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
          paddingHorizontal: wp(4),
        }}
      >
        {leftIcon && (
          <View
            style={{
              marginRight: wp(3),
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
              paddingVertical: hp(2),
              color: colors.text,
            },
            style,
          ]}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={moderateScale(22)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {!!error && (
        <AppText
          variant='caption'
          color={colors.error}
          style={{ marginTop: hp(0.5) }}
        >
          {error}
        </AppText>
      )}
    </View>
  );
};

export default PasswordInput;
