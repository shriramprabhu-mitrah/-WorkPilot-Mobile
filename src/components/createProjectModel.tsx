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
import {
  resetProjects,
  setNewSprint,
} from '../store/project_store/reducer/project_reducer';
import {
  projectApi,
  useCreateSprintMutation,
  useGetSprintsQuery,
} from '../store/api/projectApi';
import { showSnackbar } from './common/Snackbar';
import DatePickerModal from './datePickerModel';

export interface CreateSprintPayload {
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
}

export interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'project' | 'role' | 'sprint';
  projectId?: string;
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
  projectId,
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
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDateType, setSelectedDateType] = useState<
    'start' | 'end' | null
  >(null);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [isGoalFocused, setIsGoalFocused] = useState(false);

  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth?.loading);
  const isRole = mode === 'role';
  const isSprint = mode === 'sprint';

  const [createSprint, { isLoading: isCreatingSprint }] =
    useCreateSprintMutation();
  const { refetch: refetchSprints } = useGetSprintsQuery(
    {
      project_id: projectId!,
      page: 1,
    },
    {
      skip: !projectId || !isSprint,
    },
  );

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
    setSprintGoal('');
    setStartDate('');
    setEndDate('');
    setRoleNameError(undefined);
    setIsNameFocused(false);
    setIsDescFocused(false);
    setIsGoalFocused(false);
    dispatch(handleLoading(false));
    onClose();
  };

  const handleSubmit = async () => {
    const name = projectName.trim();
    if (!name) {
      const entityName = isSprint ? 'Sprint' : isRole ? 'Role' : 'Project';
      showSuccessToast?.(`${entityName} name is required`, 'error');
      return;
    }

    if (isSprint) {
      if (!projectId) {
        showSnackbar?.({
          message: 'Project ID is required to create sprint',
          type: 'error',
        });
        return;
      }

      try {
        await createSprint({
          project_id: projectId,
          name,
          goal: sprintGoal.trim(),
          start_date: startDate.trim(),
          end_date: endDate.trim(),
        }).unwrap();
        dispatch(setNewSprint(name));
        handleClose();
        await refetchSprints();
        onSuccess?.();
        showSnackbar?.({
          message: 'Sprint created successfully',
          type: 'success',
        });
      } catch {}
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

  const isSubmitting = loading || isCreatingRole || isCreatingSprint;
  const isSubmitDisabled = !projectName.trim() || isSubmitting;

  const modalHeaderTitle =
    title ??
    (isSprint ? 'Create Sprint' : isRole ? 'Create Role' : 'New Project');
  const actionButtonText = isSprint
    ? 'Create Sprint'
    : isRole
      ? 'Create Role'
      : 'Create Project';

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
                    {modalHeaderTitle}
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ padding: moderateScale(4) }}
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
                        {isSprint
                          ? 'Sprint name '
                          : isRole
                            ? 'Role name '
                            : 'Project name '}
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
                          isSprint
                            ? 'Enter sprint name...'
                            : isRole
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

                  {/* Field 2: Description (Project mode and Sprint mode only) */}
                  {isSprint && (
                    <>
                      <View style={{ gap: moderateScale(6) }}>
                        <AppText
                          variant='body'
                          color={colors.text}
                          style={{
                            fontWeight: '600',
                            fontSize: moderateScale(14),
                          }}
                        >
                          Sprint Goal
                        </AppText>
                        <View
                          style={{
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: isGoalFocused
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
                            value={sprintGoal}
                            onChangeText={setSprintGoal}
                            placeholder='Enter sprint goal...'
                            placeholderTextColor={
                              colors.placeholder ||
                              colors.textSecondary ||
                              '#94A3B8'
                            }
                            onFocus={() => setIsGoalFocused(true)}
                            onBlur={() => setIsGoalFocused(false)}
                            style={{
                              fontSize: moderateScale(14),
                              color: colors.text,
                              padding: 0,
                            }}
                          />
                        </View>
                      </View>

                      {/* Dates */}
                      <View style={{ gap: moderateScale(6) }}>
                        <AppText
                          variant='body'
                          color={colors.text}
                          style={{
                            fontWeight: '600',
                            fontSize: moderateScale(14),
                          }}
                        >
                          Start Date
                        </AppText>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedDateType('start')}
                          style={{
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border || '#E2E8F0',
                            borderRadius: Radius.sm || moderateScale(8),
                            paddingHorizontal: moderateScale(12),
                            paddingVertical: moderateScale(10),
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <AppText
                            style={{
                              fontSize: moderateScale(14),
                              color: startDate
                                ? colors.text
                                : colors.placeholder || '#94A3B8',
                            }}
                          >
                            {startDate || 'Select start date'}
                          </AppText>
                          <Ionicons
                            name='calendar-outline'
                            size={moderateScale(18)}
                            color={colors.textSecondary || '#94A3B8'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{ gap: moderateScale(6) }}>
                        <AppText
                          variant='body'
                          color={colors.text}
                          style={{
                            fontWeight: '600',
                            fontSize: moderateScale(14),
                          }}
                        >
                          End Date
                        </AppText>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedDateType('end')}
                          style={{
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border || '#E2E8F0',
                            borderRadius: Radius.sm || moderateScale(8),
                            paddingHorizontal: moderateScale(12),
                            paddingVertical: moderateScale(10),
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <AppText
                            style={{
                              fontSize: moderateScale(14),
                              color: endDate
                                ? colors.text
                                : colors.placeholder || '#94A3B8',
                            }}
                          >
                            {endDate || 'Select end date'}
                          </AppText>
                          <Ionicons
                            name='calendar-outline'
                            size={moderateScale(18)}
                            color={colors.textSecondary || '#94A3B8'}
                          />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Project Mode Description Field */}
                  {!isRole && !isSprint && (
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
                      backgroundColor: isSubmitDisabled
                        ? '#94A3B8'
                        : colors.primary || '#0E6FFF',
                      borderRadius: Radius.sm || moderateScale(8),
                      paddingVertical: moderateScale(8),
                      paddingHorizontal: moderateScale(16),
                      minWidth: moderateScale(110),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSubmitting ? (
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
                        {actionButtonText}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <DatePickerModal
        visible={selectedDateType !== null}
        title={
          selectedDateType === 'start' ? 'Select Start Date' : 'Select End Date'
        }
        selectedDate={selectedDateType === 'start' ? startDate : endDate}
        minDate={selectedDateType === 'end' ? startDate : undefined}
        onClose={() => setSelectedDateType(null)}
        onSelectDate={date => {
          if (selectedDateType === 'start') {
            setStartDate(date);
          } else if (selectedDateType === 'end') {
            setEndDate(date);
          }
        }}
      />
    </Modal>
  );
};

export default CreateProjectModal;
