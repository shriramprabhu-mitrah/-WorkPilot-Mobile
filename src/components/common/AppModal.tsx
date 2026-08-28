import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';

import AppText from './AppText';
import { ThemeColors } from '../../constants/Colors';

interface Props {
  visible: boolean;
  title?: string;
  colors: ThemeColors;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
}

const AppModal = ({
  visible,
  title,
  colors,
  children,
  onClose,
  showCloseButton = true,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      {/* Dynamic backdrop color */}
      <View
        className='flex-1 items-center justify-center'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className='w-[85%] rounded-xl p-5'
          style={{
            backgroundColor: colors?.card || colors?.surface,
            borderWidth: 1,
            borderColor: colors?.border,
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className='mb-4 flex-row items-center justify-between'>
              {title ? (
                <AppText
                  variant='bodyLarge'
                  color={colors?.text}
                  className='font-bold'
                >
                  {title}
                </AppText>
              ) : (
                <View />
              )}

              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className='h-8 w-8 items-center justify-center rounded-full'
                  style={{
                    backgroundColor: colors?.surface || colors?.background,
                  }}
                  hitSlop={8}
                >
                  <AppText variant='body' color={colors?.text}>
                    ✕
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
};

export default AppModal;
