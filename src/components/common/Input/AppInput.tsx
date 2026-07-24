import React, { ReactNode, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import AppText from '../AppText';
import { useResponsive } from '../../../utils/responsive';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

const AppInput = ({ label, error, leftIcon, style, ...props }: Props) => {
  const { colors } = useTheme();
  const { wp, hp, moderateScale } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      {label && (
        <AppText
          variant='body'
          style={{
            marginBottom: hp(1),
          }}
        >
          {label}
        </AppText>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error
            ? colors.error
            : isFocused
              ? '#0E6FFF'
              : colors.border,
          borderRadius: Radius.md,
          paddingHorizontal: wp(4),
        }}
      >
        {leftIcon && (
          <View
            style={{
              marginRight: moderateScale(10),
            }}
          >
            {leftIcon}
          </View>
        )}

        <TextInput
          {...props}
          placeholderTextColor={colors.placeholder}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChangeText={text => {
            props.onChangeText?.(text);
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
      </View>

      {!!error && (
        <AppText
          variant='caption'
          color={colors.error}
          style={{
            marginTop: hp(0.5),
          }}
        >
          {error}
        </AppText>
      )}
    </View>
  );
};

export default AppInput;
