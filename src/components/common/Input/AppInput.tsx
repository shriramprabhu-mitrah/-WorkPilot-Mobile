import React, { ReactNode, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import AppText from '../AppText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

const AppInput = ({ label, error, leftIcon, style, ...props }: Props) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight, isLargeHeight, hp, verticalScale } =
    useAuthLayout();
  const [isFocused, setIsFocused] = useState(false);

  // Dynamic vertical padding driven by useAuthLayout height tiers
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
            marginBottom: hp(0.8),
            fontSize: layout.bodyFontSize,
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
          paddingHorizontal: layout.paddingHorizontal / 1.5,
        }}
      >
        {leftIcon && (
          <View
            style={{
              marginRight: layout.elementGap,
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
              paddingVertical: inputPaddingVertical,
              fontSize: layout.bodyFontSize,
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

export default AppInput;
