import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './AppText';
import { useTheme } from '../../hooks/useTheme';
import { CustomDialogProps } from '../../types/dialogType';

export const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  onDismiss,
  title,
  content,
  iconName,
  iconColor,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = true,
  showCloseIcon = true,
}) => {
  const { colors } = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: colors.surface, borderRadius: 16 }}
      >
        {/* Top Right Close Icon */}
        {showCloseIcon && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDismiss}
            className='absolute right-4 top-4 z-10 p-1'
          >
            <Ionicons
              name='close-outline'
              size={22}
              color={colors.textSecondary || '#6B778C'}
            />
          </TouchableOpacity>
        )}

        {/* Optional Dialog Icon */}
        {iconName && (
          <Dialog.Icon
            icon={iconName}
            color={iconColor || colors.primary}
            size={32}
          />
        )}

        {/* Dynamic Theme Title */}
        {title && (
          <Dialog.Title className='text-center text-lg font-bold'>
            <AppText variant='h3' color={colors.text} className='text-center'>
              {title}
            </AppText>
          </Dialog.Title>
        )}

        {/* Dynamic Theme Content */}
        <Dialog.Content className='px-6 py-2'>
          {typeof content === 'string' ? (
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='text-center text-sm'
            >
              {content}
            </AppText>
          ) : (
            content
          )}
        </Dialog.Content>

        {/* Action Buttons Row */}
        <Dialog.Actions className='flex-row justify-end space-x-3 px-4 pb-4'>
          {showCancel && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDismiss}
              className='rounded-lg px-4 py-2'
            >
              <AppText
                variant='body'
                color={colors.textSecondary}
                className='font-semibold'
              >
                {cancelText}
              </AppText>
            </TouchableOpacity>
          )}

          {onConfirm && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onConfirm();
                onDismiss();
              }}
              style={{ backgroundColor: colors.primary }}
              className='rounded-lg px-5 py-2'
            >
              <AppText
                variant='body'
                color={colors.white || '#FFFFFF'}
                className='font-bold'
              >
                {confirmText}
              </AppText>
            </TouchableOpacity>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CustomDialog;
