import React from 'react';
import { Modal, Pressable, View, type ModalProps } from 'react-native';

import AppText from './AppText';

interface Props {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
}

const AppModal = ({
  visible,
  title,
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
      <View className='flex-1 items-center justify-center bg-black/40'>
        <View className='w-[85%] rounded-xl bg-white p-5'>
          {/* Header */}
          {(title || showCloseButton) && (
            <View className='mb-4 flex-row items-center justify-between'>
              {title ? <AppText variant='body'>{title}</AppText> : <View />}

              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  className='h-8 w-8 items-center justify-center rounded-full'
                >
                  <AppText variant='body'>×</AppText>
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default AppModal;
