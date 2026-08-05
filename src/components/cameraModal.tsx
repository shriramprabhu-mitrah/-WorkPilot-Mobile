import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
  title?: string;
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
  title = 'Update Profile Picture',
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className='flex-1 justify-end bg-black/50'
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className='relative rounded-t-3xl'
          style={{
            backgroundColor: colors.card || colors.surface,
            padding: moderateScale(25),
            paddingBottom: isSmallHeight ? hp(7) : hp(6),
          }}
        >
          <AppText
            variant='title'
            color={colors.text}
            className='mb-4 font-bold'
          >
            {title}
          </AppText>
          <TouchableOpacity
            className='absolute right-5 top-5 z-40'
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name='close'
              size={layout.iconSize}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row items-center border-b'
            style={{
              borderBottomColor: colors.border,
              gap: layout.elementGap,
              paddingVertical: moderateScale(15),
            }}
            onPress={onSelectGallery}
          >
            <Ionicons name='images-outline' size={22} color={colors.primary} />
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-medium'
            >
              Choose from Gallery
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row items-center border-b'
            style={{
              borderBottomColor: colors.border,
              gap: layout.elementGap,
              paddingVertical: moderateScale(15),
            }}
            onPress={onSelectCamera}
          >
            <Ionicons name='camera-outline' size={22} color={colors.primary} />
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-medium'
            >
              Take Photo
            </AppText>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CameraModal;
