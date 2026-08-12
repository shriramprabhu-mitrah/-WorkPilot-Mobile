import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { PrimaryButton } from './common/Button';
import { AppInput } from './common/Input';
import { Radius } from '../constants/Radius';
import { useAppDispatch } from '../store';
import { showSuccessToast } from '../utils/utils';
import {
  getAllProjectInfo,
  createNewProject,
} from '../store/project_store/action/project_thunk';

export type ModalMode = 'camera' | 'createProject';

interface PopupModelProps {
  visible: boolean;
  mode?: ModalMode;
  onClose: () => void;
  onSelectGallery?: () => void;
  onSelectCamera?: () => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
}

const PopupModel: React.FC<PopupModelProps> = ({
  visible,
  mode = 'camera',
  onClose,
  onSelectGallery,
  onSelectCamera,
  onRemovePhoto,
  showRemoveOption = false,
  title,
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isFullScreen = mode === 'createProject';
  const handleSubmit = async () => {
    if (!projectName.trim()) {
      showSuccessToast?.('Project name is required', 'error');
      return;
    }
    setLoading(true);
    const payload = {
      name: projectName,
      description: projectDescription,
    };
    dispatch(
      createNewProject({
        payload,
        showSuccessToast,
        handleSuccess,
      }),
    );
  };

  const handleSuccess = () => {
    setLoading(false);
    dispatch(getAllProjectInfo());
    handleClose();
  };

  const handleClose = () => {
    setProjectName('');
    setProjectDescription('');
    onClose();
  };

  const modalTitle =
    title || (isFullScreen ? 'Create Project' : 'Update Profile Picture');

  return (
    <Modal
      visible={visible}
      transparent={!isFullScreen}
      animationType='slide'
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        className={isFullScreen ? '' : 'justify-end bg-black/50'}
        activeOpacity={1}
        onPress={isFullScreen ? undefined : handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: isFullScreen ? 1 : undefined }}
        >
          <TouchableWithoutFeedback>
            <View
              className={`relative ${isFullScreen ? 'flex-1' : 'rounded-t-3xl border'}`}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: moderateScale(5),
                paddingBottom: isFullScreen ? moderateScale(20) : hp(7),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: moderateScale(20),
                  marginBottom: moderateScale(10),
                  marginTop: isFullScreen
                    ? moderateScale(50)
                    : moderateScale(20),
                }}
              >
                <TouchableOpacity
                  className='border'
                  style={{
                    borderColor: colors.border,
                    borderRadius: Radius.circle,
                    padding: moderateScale(5),
                  }}
                  onPress={handleClose}
                >
                  <Ionicons
                    name='close'
                    size={layout.iconSize}
                    color={colors.text}
                  />
                </TouchableOpacity>
                <AppText variant='title' className='font-bold'>
                  {modalTitle}
                </AppText>
                {mode === 'camera' && showRemoveOption ? (
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
              {mode === 'camera' && (
                <View>
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
                      style={{ fontSize: layout.bodyFontSize }}
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
                      style={{ fontSize: layout.bodyFontSize }}
                    >
                      Gallery
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}
              {isFullScreen && (
                <ScrollView
                  style={{ flex: 1 }}
                  keyboardShouldPersistTaps='handled'
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: layout.paddingHorizontal,
                    paddingTop: moderateScale(10),
                    paddingBottom: moderateScale(20),
                    gap: isSmallHeight ? moderateScale(12) : layout.sectionGap,
                  }}
                >
                  <AppInput
                    label='Project Name'
                    placeholder='Enter project name...'
                    value={projectName}
                    leftIcon={
                      <Ionicons
                        name='folder-outline'
                        size={20}
                        color={colors.textSecondary}
                      />
                    }
                    onChangeText={setProjectName}
                  />
                  <AppInput
                    label='Description'
                    placeholder='Enter project description...'
                    value={projectDescription}
                    multiline
                    numberOfLines={7}
                    leftIcon={
                      <Ionicons
                        name='document-text-outline'
                        size={20}
                        color={colors.textSecondary}
                      />
                    }
                    onChangeText={setProjectDescription}
                  />
                  <View style={{ marginTop: layout.tightGap }}>
                    <PrimaryButton
                      title='Create Project'
                      disabled={!projectName.trim()}
                      onPress={handleSubmit}
                    />
                  </View>
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default PopupModel;
