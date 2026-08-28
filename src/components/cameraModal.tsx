import React from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';

interface CameraPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery?: () => void;
  onSelectCamera?: () => void;
  onSelectFile?: () => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
}

export const CameraPickerModal: React.FC<CameraPickerModalProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
  onSelectFile,
  onRemovePhoto,
  showRemoveOption = false,
  title = 'Update Profile Picture',
}) => {
  const { colors } = useTheme();
  const { layout, hp } = useAuthLayout();
  const isAddAttachment = title === 'Add Attachment';
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
        <TouchableWithoutFeedback>
          <View
            className='relative rounded-t-3xl border p-1.5'
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: hp(7),
            }}
          >
            <View className='mb-2.5 mt-5 flex-row items-center justify-between px-5'>
              <TouchableOpacity
                className='items-center justify-center border p-1.5'
                style={{
                  borderColor: colors.border,
                  borderRadius: Radius.circle,
                }}
                onPress={onClose}
              >
                <Ionicons
                  name='close'
                  size={layout.iconSize}
                  color={colors.text}
                />
              </TouchableOpacity>
              <AppText variant='title' className='font-bold'>
                {title}
              </AppText>
              {showRemoveOption ? (
                <TouchableOpacity onPress={onRemovePhoto}>
                  <Ionicons
                    name='trash-outline'
                    size={layout.iconSize}
                    color={colors.error}
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ width: layout.iconSize }} />
              )}
            </View>
            <View className='py-1'>
              <TouchableOpacity
                onPress={onSelectCamera}
                className='flex-row items-center gap-4 px-5 py-3.5'
              >
                <Ionicons
                  name='camera-outline'
                  size={layout.iconSize + 2}
                  color={colors.primary}
                />
                <AppText
                  variant='body'
                  style={{ fontSize: layout.bodyFontSize }}
                >
                  Camera
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSelectGallery}
                className='flex-row items-center gap-4 px-5 py-3.5'
              >
                <Ionicons
                  name='images-outline'
                  size={layout.iconSize + 2}
                  color={colors.primary}
                />
                <AppText
                  variant='body'
                  style={{ fontSize: layout.bodyFontSize }}
                >
                  Gallery
                </AppText>
              </TouchableOpacity>

              {/* Conditional Options if Title is 'Add Attachment' */}
              {isAddAttachment && (
                <TouchableOpacity
                  onPress={onSelectFile}
                  className='flex-row items-center gap-4 px-5 py-3.5'
                >
                  <Ionicons
                    name='document-attach-outline'
                    size={layout.iconSize + 2}
                    color={colors.primary}
                  />
                  <AppText
                    variant='body'
                    style={{ fontSize: layout.bodyFontSize }}
                  >
                    Choose File
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};
export default CameraPickerModal;
