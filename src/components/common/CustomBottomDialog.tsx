import React from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './AppText';
import { useTheme } from '../../hooks/useTheme';
import { moderateScale } from '../../utils/responsive';
import { useAuthLayout } from '../../hooks/useAuthLayout';

export interface CustomBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string | React.ReactNode;
  iconName?: string;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  showCloseIcon?: boolean;
  confirmButtonColor?: string;
  confirmTextColor?: string;
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  visible,
  onDismiss,
  title,
  message,
  iconName,
  iconColor,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = true,
  showCloseIcon = true,
  confirmButtonColor,
  confirmTextColor,
}) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const closeIconSize = moderateScale(20);
  const mainIconSize = moderateScale(36);
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View className='flex-1 justify-end bg-black/50'>
        <Pressable className='flex-1' onPress={onDismiss} />
        <View
          style={{
            backgroundColor: colors.surface,
            paddingBottom: bottomPadding + 16,
            borderColor: colors.border,
          }}
          className='w-full rounded-t-3xl border px-6 pt-3 shadow-xl'
        >
          <View className='items-center pb-3'>
            <View
              style={{ backgroundColor: colors.border || '#E2E8F0' }}
              className='h-1.5 w-12 rounded-full'
            />
          </View>
          {showCloseIcon && (
            <View className='flex-row justify-end pb-1'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDismiss}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className='rounded-full border p-2'
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name='close-outline'
                  size={closeIconSize}
                  color={colors.textSecondary || '#6B778C'}
                />
              </TouchableOpacity>
            </View>
          )}
          {iconName && (
            <View className='items-center justify-center pb-3'>
              <Ionicons
                name={iconName as any}
                color={iconColor || colors.primary}
                size={mainIconSize}
              />
            </View>
          )}
          {title && (
            <AppText
              variant='h2'
              color={colors.text}
              style={{ fontSize: moderateScale(20) }}
              className='pb-2 text-left font-bold'
            >
              {title}
            </AppText>
          )}
          {message && (
            <View className='pb-6'>
              {typeof message === 'string' ? (
                <AppText
                  variant='body'
                  color={colors.textSecondary}
                  style={{
                    fontSize: moderateScale(13),
                    lineHeight: moderateScale(19),
                  }}
                  className='text-left'
                >
                  {message}
                </AppText>
              ) : (
                message
              )}
            </View>
          )}
          <View
            className='flex-row items-center justify-end space-x-3 pt-2'
            style={{ gap: layout.sectionGap }}
          >
            {showCancel && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDismiss}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className='rounded-xl border px-5 py-3'
              >
                <AppText
                  variant='body'
                  color={colors.text}
                  style={{ fontSize: moderateScale(14) }}
                  className='font-semibold'
                >
                  {cancelText}
                </AppText>
              </TouchableOpacity>
            )}
            {confirmText && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (onConfirm) onConfirm();
                  onDismiss();
                }}
                style={{
                  backgroundColor: confirmButtonColor || colors.primary,
                }}
                className='rounded-xl px-6 py-3'
              >
                <AppText
                  variant='body'
                  color={confirmTextColor || colors.white || '#FFFFFF'}
                  style={{ fontSize: moderateScale(14) }}
                  className='font-bold'
                >
                  {confirmText}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomBottomSheet;
