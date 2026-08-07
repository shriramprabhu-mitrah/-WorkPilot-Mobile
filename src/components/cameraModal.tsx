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
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
  onRemovePhoto,
  showRemoveOption = false,
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
          className='relative rounded-t-3xl border'
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: moderateScale(5),
            paddingBottom: isSmallHeight ? hp(7) : hp(6),
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: moderateScale(42),
              height: moderateScale(5),
              borderRadius: 10,
              backgroundColor: colors.border,
              marginTop: moderateScale(10),
              marginBottom: moderateScale(18),
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: moderateScale(20),
              marginBottom: moderateScale(10),
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name='close'
                size={layout.iconSize}
                color={colors.text}
              />
            </TouchableOpacity>
            <AppText variant='title' className='font-bold'>
              {title}
            </AppText>
            <TouchableOpacity onPress={onRemovePhoto}>
              <Ionicons
                name='trash-outline'
                size={layout.iconSize}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onSelectCamera}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: moderateScale(22),
              paddingVertical: moderateScale(14),
              gap: moderateScale(16),
            }}
          >
            <Ionicons
              name='camera-outline'
              size={layout.iconSize + 2}
              color={colors.primary}
            />
            <AppText
              variant='body'
              style={{
                fontSize: layout.bodyFontSize,
              }}
            >
              Camera
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSelectGallery}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: moderateScale(22),
              paddingVertical: moderateScale(14),
              gap: moderateScale(16),
            }}
          >
            <Ionicons
              name='images-outline'
              size={layout.iconSize + 2}
              color={colors.primary}
            />
            <AppText
              variant='body'
              style={{
                fontSize: layout.bodyFontSize,
              }}
            >
              Gallery
            </AppText>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CameraModal;
