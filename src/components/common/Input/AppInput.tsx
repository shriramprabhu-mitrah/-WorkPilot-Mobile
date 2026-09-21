import React, { ReactNode, useState, forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import AppText from '../AppText';
import { moderateScale } from '../../../utils/responsive';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightSendButton?: ReactNode;
  disabled?: boolean;
}

const AppInput = forwardRef<TextInput, Props>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      style,
      rightSendButton,
      disabled = false,
      autoComplete,
      ...props
    },
    ref,
  ) => {
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
            opacity: disabled ? 0.7 : 1,
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
            ref={ref}
            {...props}
            editable={!disabled}
            autoFocus={props.autoFocus ?? false}
            // Disables OS Clipboard Suggestions popups on focus
            autoComplete={autoComplete || 'off'}
            contextMenuHidden={props.contextMenuHidden ?? true}
            placeholderTextColor={colors.placeholder}
            onFocus={e => {
              if (!disabled) {
                setIsFocused(true);
              }
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
                color: disabled ? colors.textSecondary : colors.text,
              },
              style,
            ]}
          />

          {rightIcon && (
            <View
              style={{
                marginLeft: moderateScale(10),
              }}
            >
              {rightIcon}
            </View>
          )}

          {rightSendButton && (
            <View
              style={{
                marginLeft: moderateScale(10),
              }}
            >
              {rightSendButton}
            </View>
          )}
        </View>
        {!!error ? (
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
        ) : !!helperText ? (
          <AppText
            variant='caption'
            style={{
              marginTop: layout.tightGap,
              fontSize: layout.captionFontSize,
              color: colors.textSecondary,
            }}
          >
            {helperText}
          </AppText>
        ) : null}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
