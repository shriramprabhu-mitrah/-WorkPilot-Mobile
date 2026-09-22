import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { PrimaryButton } from './common/Button';
import { AppInput } from './common/Input';
import AppText from './common/AppText';
import { useAppDispatch, useAppSelector } from '../store';
import { showSuccessToast } from '../utils/utils';
import {
  getAllProjectInfo,
  createNewProject,
} from '../store/project_store/action/project_thunk';
import { handleLoading } from '../store/auth_store/reducer/auth.reducer';
import { resetProjects } from '../store/project_store/reducer/project_reducer';
import CommonHeader from './common/CommonHeader';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'project' | 'role';
  onCreateRole?: (name: string) => Promise<void> | void;
  validateRoleName?: (name: string) => string | undefined;
  isCreatingRole?: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  title,
  mode = 'project',
  onCreateRole,
  validateRoleName,
  isCreatingRole = false,
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight } = useAuthLayout();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [roleNameError, setRoleNameError] = useState<string>();

  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth?.loading);
  const isRole = mode === 'role';

  const handleProjectSuccess = () => {
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
    setRoleNameError(undefined);
    dispatch(handleLoading(false));
    onClose();
  };

  const handleSubmit = async () => {
    const name = projectName.trim();
    if (!name) {
      showSuccessToast?.(
        `${isRole ? 'Role' : 'Project'} name is required`,
        'error',
      );
      return;
    }
    if (isRole) {
      const validationError = validateRoleName?.(name);
      if (validationError) {
        setRoleNameError(validationError);
        return;
      }
      try {
        await onCreateRole?.(name);
        handleClose();
      } catch {
        // The API layer displays the error. Keep the modal open for retry.
      }
      return;
    }
    dispatch(handleLoading(true));
    const payload = {
      name,
      description: projectDescription,
    };
    dispatch(
      createNewProject({
        payload,
        showSuccessToast,
        handleSuccess: handleProjectSuccess,
      }),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={isRole}
      animationType={isRole ? 'fade' : 'slide'}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        {isRole ? (
          <TouchableWithoutFeedback onPress={handleClose}>
            <View
              className='flex-1 items-center justify-center px-5'
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  className='w-full rounded-2xl border p-5'
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                >
                  <View className='mb-4 flex-row items-center justify-between'>
                    <AppText
                      variant='bodyLarge'
                      color={colors.text}
                      className='font-bold'
                    >
                      {title ?? 'Create Role'}
                    </AppText>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClose}
                      className='h-8 w-8 items-center justify-center rounded-full'
                      style={{ backgroundColor: colors.border + '40' }}
                    >
                      <Ionicons
                        name='close'
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <AppInput
                    label='Role Name'
                    placeholder='Enter role name...'
                    value={projectName}
                    error={roleNameError}
                    leftIcon={
                      <Ionicons
                        name='shield-outline'
                        size={20}
                        color={colors.textSecondary}
                      />
                    }
                    onChangeText={text => {
                      setProjectName(text);
                      setRoleNameError(
                        text.trim() ? validateRoleName?.(text) : undefined,
                      );
                    }}
                  />
                  <View className='mt-5 flex-row gap-3'>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClose}
                      className='flex-1 items-center justify-center rounded-xl border py-3'
                      style={{ borderColor: colors.border }}
                    >
                      <AppText
                        variant='body'
                        color={colors.textSecondary}
                        className='font-semibold'
                      >
                        Cancel
                      </AppText>
                    </TouchableOpacity>

                    <View className='flex-1'>
                      <PrimaryButton
                        title='Create Role'
                        loading={isCreatingRole}
                        disabled={
                          !projectName.trim() ||
                          !!roleNameError ||
                          isCreatingRole
                        }
                        onPress={handleSubmit}
                      />
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback>
            <View
              className='relative flex-1 p-1.5 pb-5'
              style={{ backgroundColor: colors.surface }}
            >
              <CommonHeader
                variant='createProject'
                title={title ?? 'Create Project'}
                onBackPress={handleClose}
                containerStyle={{ paddingTop: moderateScale(20) }}
              />
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
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};
