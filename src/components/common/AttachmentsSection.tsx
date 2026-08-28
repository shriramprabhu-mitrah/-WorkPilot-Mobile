import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleProp,
  ViewStyle,
  Keyboard,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

import AppText from '../common/AppText';
import { AttachmentMenu } from '../../components/Attachments/AttachmentMenu';
import { AttachmentList } from '../../components/Attachments/AttachmentList';
import { AttachmentFile } from '../../data/addNewIssuesData';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';

export interface AttachmentsSectionProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (
    updater: AttachmentFile[] | ((prev: AttachmentFile[]) => AttachmentFile[]),
  ) => void;
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  customTrigger?: (openMenu: () => void) => React.ReactNode;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onAttachmentsChange,
  title,
  containerStyle,
  customTrigger,
}) => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenuSafely = () => {
    Keyboard.dismiss();
    setMenuVisible(true);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  // 1. Gallery Pick (Photo or Video)
  const handleChoosePhotoOrVideo = async () => {
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
      });

      const isVideo = media.mime?.startsWith('video');

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: media.path,
        name: media.filename || `${isVideo ? 'video' : 'photo'}_${Date.now()}`,
        type: isVideo ? 'video' : 'image',
        size: media.size,
      };

      onAttachmentsChange(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to pick media');
      }
    }
  };

  // 2. Camera - Take Photo with Cropping
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access required.');
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
        compressImageQuality: 0.8,
      });

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: image.path,
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
        size: image.size,
      };

      onAttachmentsChange(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to capture photo');
      }
    }
  };

  // 3. Camera - Record Video Directly
  const handleRecordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access required.');
      return;
    }

    try {
      const video = await ImagePicker.openCamera({
        mediaType: 'video',
      });

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: video.path,
        name: `video_${Date.now()}.mp4`,
        type: 'video',
        size: video.size,
      };

      onAttachmentsChange(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to record video');
      }
    }
  };

  // 4. Document / File Picker
  const handleChooseFile = async () => {
    try {
      const res = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });

      const newFiles: AttachmentFile[] = res.map((doc, index) => ({
        id: `${Date.now()}-${index}`,
        uri: doc.uri,
        name: doc.name || 'Document',
        type: 'file',
        size: doc.size ?? undefined,
      }));

      onAttachmentsChange(prev => [...prev, ...newFiles]);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('Error', 'Unable to pick document');
    }
  };

  const handleSelectOption = (optionId: string) => {
    setMenuVisible(false);
    switch (optionId) {
      case '1':
        handleChoosePhotoOrVideo();
        break;
      case '2':
        handleTakePhoto();
        break;
      case '3':
        handleRecordVideo();
        break;
      case '4':
        handleChooseFile();
        break;
      default:
        break;
    }
  };

  const handleRemoveAttachment = (id: string) => {
    onAttachmentsChange(prev => prev.filter(item => item.id !== id));
  };

  return (
    <View style={[{ gap: layout.elementGap }, containerStyle]}>
      <AttachmentMenu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        onSelectOption={handleSelectOption}
        anchor={
          customTrigger ? (
            customTrigger(openMenuSafely)
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openMenuSafely}
              className='flex-row items-center'
              style={{ gap: layout.elementGap }}
            >
              <Ionicons name='image-outline' size={20} color={colors.primary} />
              <AppText
                variant='bodyLarge'
                color={colors.primary}
                className='font-bold'
              >
                {title ||
                  strings.createIssue?.addAttachment ||
                  'Add attachment'}
              </AppText>
            </TouchableOpacity>
          )
        }
      />

      {attachments.length > 0 && (
        <AttachmentList
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          colors={colors}
          layout={layout}
        />
      )}
    </View>
  );
};

export default AttachmentsSection;
