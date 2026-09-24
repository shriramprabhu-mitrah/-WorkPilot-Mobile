import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import AppText from './common/AppText';
import { useAppDispatch, useAppSelector } from '../store';
import { showSuccessToast } from '../utils/utils';
import {
  getAllProjectInfo,
  createNewProject,
} from '../store/project_store/action/project_thunk';
import { handleLoading } from '../store/auth_store/reducer/auth.reducer';
import { resetProjects } from '../store/project_store/reducer/project_reducer';
import { projectApi } from '../store/api/projectApi';

export interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'project' | 'role';
  onCreateRole?: (name: string) => Promise<void> | void;
  validateRoleName?: (name: string) => string | undefined;
  isCreatingRole?: boolean;
  onSuccess?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  title,
  mode = 'project',
  onCreateRole,
  validateRoleName,
  isCreatingRole = false,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { isSmallHeight } = useAuthLayout();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [roleNameError, setRoleNameError] = useState<string>();
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

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
    dispatch(projectApi.util.invalidateTags(['Projects']));
    onSuccess?.();
    handleClose();
  };

  const handleClose = () => {
    setProjectName('');
    setProjectDescription('');
    setRoleNameError(undefined);
    setIsNameFocused(false);
    setIsDescFocused(false);
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
        // Keep modal open on error
      }
      return;
    }

    dispatch(handleLoading(true));
    const payload = {
      name,
      description: projectDescription.trim(),
    };
    dispatch(
      createNewProject({
        payload,
        showSuccessToast,
        handleSuccess: handleProjectSuccess,
      }),
    );
  };

  const isSubmitDisabled = !projectName.trim() || loading || isCreatingRole;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View
            className='flex-1 items-center justify-center px-4'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                className='w-full rounded-2xl shadow-xl'
                style={{
                  backgroundColor: colors.surface || colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  maxWidth: moderateScale(420),
                  borderRadius: Radius.lg || moderateScale(16),
                  overflow: 'hidden',
                }}
              >
                {/* Header Section */}
                <View
                  className='flex-row items-center justify-between'
                  style={{
                    paddingHorizontal: moderateScale(20),
                    paddingTop: moderateScale(18),
                    paddingBottom: moderateScale(14),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border || '#F1F5F9',
                  }}
                >
                  <AppText
                    variant='h3'
                    color={colors.text}
                    style={{
                      fontSize: moderateScale(18),
                      fontWeight: '700',
                    }}
                  >
                    {title ?? (isRole ? 'Create Role' : 'New Project')}
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      padding: moderateScale(4),
                    }}
                  >
                    <Ionicons
                      name='close'
                      size={moderateScale(20)}
                      color={colors.textSecondary || '#94A3B8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Body Content */}
                <ScrollView
                  keyboardShouldPersistTaps='handled'
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: moderateScale(20),
                    paddingTop: moderateScale(18),
                    paddingBottom: moderateScale(12),
                    gap: isSmallHeight ? moderateScale(12) : moderateScale(16),
                  }}
                >
                  {/* Field 1: Name */}
                  <View style={{ gap: moderateScale(6) }}>
                    <View className='flex-row items-center'>
                      <AppText
                        variant='body'
                        color={colors.text}
                        style={{
                          fontWeight: '600',
                          fontSize: moderateScale(14),
                        }}
                      >
                        {isRole ? 'Role name ' : 'Project name '}
                      </AppText>
                      <AppText
                        style={{
                          color: colors.error || '#EF4444',
                          fontWeight: 'bold',
                          fontSize: moderateScale(14),
                        }}
                      >
                        *
                      </AppText>
                    </View>

                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: roleNameError
                          ? colors.error
                          : isNameFocused
                            ? colors.primary || '#0E6FFF'
                            : colors.border || '#E2E8F0',
                        borderRadius: Radius.sm || moderateScale(8),
                        paddingHorizontal: moderateScale(12),
                        paddingVertical:
                          Platform.OS === 'ios'
                            ? moderateScale(10)
                            : moderateScale(8),
                      }}
                    >
                      <TextInput
                        value={projectName}
                        onChangeText={text => {
                          setProjectName(text);
                          if (isRole) {
                            setRoleNameError(
                              text.trim()
                                ? validateRoleName?.(text)
                                : undefined,
                            );
                          }
                        }}
                        placeholder={
                          isRole
                            ? 'Enter role name...'
                            : 'e.g. WorkPilot Mobile App'
                        }
                        placeholderTextColor={
                          colors.placeholder ||
                          colors.textSecondary ||
                          '#94A3B8'
                        }
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        style={{
                          fontSize: moderateScale(14),
                          color: colors.text,
                          padding: 0,
                        }}
                      />
                    </View>

                    {roleNameError ? (
                      <AppText
                        variant='caption'
                        color={colors.error || '#EF4444'}
                        style={{ fontSize: moderateScale(12) }}
                      >
                        {roleNameError}
                      </AppText>
                    ) : null}
                  </View>

                  {/* Field 2: Description (Project mode only) */}
                  {!isRole && (
                    <View style={{ gap: moderateScale(6) }}>
                      <AppText
                        variant='body'
                        color={colors.text}
                        style={{
                          fontWeight: '600',
                          fontSize: moderateScale(14),
                        }}
                      >
                        Description
                      </AppText>

                      <View
                        style={{
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: isDescFocused
                            ? colors.primary || '#0E6FFF'
                            : colors.border || '#E2E8F0',
                          borderRadius: Radius.sm || moderateScale(8),
                          paddingHorizontal: moderateScale(12),
                          paddingVertical: moderateScale(10),
                          minHeight: moderateScale(100),
                        }}
                      >
                        <TextInput
                          value={projectDescription}
                          onChangeText={setProjectDescription}
                          placeholder='Briefly describe the project goal and scope...'
                          placeholderTextColor={
                            colors.placeholder ||
                            colors.textSecondary ||
                            '#94A3B8'
                          }
                          multiline
                          numberOfLines={4}
                          textAlignVertical='top'
                          onFocus={() => setIsDescFocused(true)}
                          onBlur={() => setIsDescFocused(false)}
                          style={{
                            fontSize: moderateScale(14),
                            color: colors.text,
                            padding: 0,
                            minHeight: moderateScale(80),
                          }}
                        />
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Footer Buttons Section */}
                <View
                  className='flex-row items-center justify-end'
                  style={{
                    paddingHorizontal: moderateScale(20),
                    paddingVertical: moderateScale(16),
                    gap: moderateScale(12),
                    backgroundColor: colors.card || colors.surface,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClose}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border || '#E2E8F0',
                      borderRadius: Radius.sm || moderateScale(8),
                      paddingVertical: moderateScale(8),
                      paddingHorizontal: moderateScale(16),
                      backgroundColor: colors.surface,
                    }}
                  >
                    <AppText
                      variant='body'
                      color={colors.text}
                      style={{
                        fontWeight: '600',
                        fontSize: moderateScale(14),
                      }}
                    >
                      Cancel
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isSubmitDisabled}
                    onPress={handleSubmit}
                    style={{
                      backgroundColor: isSubmitDisabled ? '#94A3B8' : '#475569',
                      borderRadius: Radius.sm || moderateScale(8),
                      paddingVertical: moderateScale(8),
                      paddingHorizontal: moderateScale(16),
                      minWidth: moderateScale(110),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {loading || isCreatingRole ? (
                      <ActivityIndicator size='small' color='#FFFFFF' />
                    ) : (
                      <AppText
                        variant='button'
                        color='#FFFFFF'
                        style={{
                          fontWeight: '600',
                          fontSize: moderateScale(14),
                        }}
                      >
                        {isRole ? 'Create Role' : 'Create Project'}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateProjectModal;
