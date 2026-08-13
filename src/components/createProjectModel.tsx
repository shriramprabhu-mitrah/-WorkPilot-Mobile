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
import { useAppDispatch, useAppSelector } from '../store';
import { showSuccessToast } from '../utils/utils';
import {
  getAllProjectInfo,
  createNewProject,
} from '../store/project_store/action/project_thunk';
import { handleLoading } from '../store/auth_store/reducer/auth.reducer';
import { resetProjects } from '../store/project_store/reducer/project_reducer';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  title = 'Create Project',
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight } = useAuthLayout();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth?.loading);

  const handleSuccess = () => {
    dispatch(handleLoading(false));
    dispatch(resetProjects());
    dispatch(
      getAllProjectInfo({
        page: 1,
        page_size: 10,
      }),
    );
    handleClose();
  };

  const handleClose = () => {
    setProjectName('');
    setProjectDescription('');
    dispatch(handleLoading(false));
    onClose();
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      showSuccessToast?.('Project name is required', 'error');
      return;
    }
    dispatch(handleLoading(true));
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

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType='slide'
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <TouchableWithoutFeedback>
          <View
            className='relative flex-1 p-1.5 pb-5'
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className='mb-2.5 flex-row items-center justify-between px-5'
              style={{ paddingTop: moderateScale(25) }}
            >
              <TouchableOpacity
                className='items-center justify-center border p-1.5'
                style={{
                  borderColor: colors.border,
                  borderRadius: Radius.circle,
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
                {title}
              </AppText>
              <View style={{ width: layout.iconSize }} />
            </View>
            <ScrollView
              className='flex-1'
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
                  loading={loading}
                  disabled={!projectName.trim() || loading}
                  onPress={handleSubmit}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
