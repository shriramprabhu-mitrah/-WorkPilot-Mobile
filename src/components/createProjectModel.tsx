import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import { pick, types } from '@react-native-documents/picker';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import {
  getPriorityLabel,
  TASK_PRIORITY_OPTIONS,
  getPriorityThemeColor,
} from '../utils/enum';
import AppText from './common/AppText';
import AppInput from './common/Input/AppInput';
import { useAppDispatch, useAppSelector } from '../store';
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
import CustomSnackbar, { SnackbarType } from './common/Snackbar/CustomSnackbar';
import DatePickerModal from './datePickerModel';
import { UserStoryStatusItem } from '../types/customstatus.type';
import { CreateUserStoryPayload } from '../types/project.type';
import { CustomDropdown, DropdownItem } from './CustomDropdown';

export interface CreateSprintPayload {
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
}

export interface StoryAttachmentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'project' | 'role' | 'sprint' | 'story';
  projectId?: string;
  sprintId?: string;
  onCreateRole?: (name: string) => Promise<void> | void;
  validateRoleName?: (name: string) => string | undefined;
  isCreatingRole?: boolean;
  onCreateStory?: (
    payload: CreateUserStoryPayload,
    attachment?: StoryAttachmentFile,
  ) => Promise<void> | void;
  isCreatingStory?: boolean;
  priorities?: string[];
  statuses?: UserStoryStatusItem[];
  onSuccess?: (message?: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  title,
  mode = 'project',
  projectId,
  sprintId,
  onCreateRole,
  validateRoleName,
  isCreatingRole = false,
  onCreateStory,
  isCreatingStory = false,
  priorities = TASK_PRIORITY_OPTIONS,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const editorRef = useRef<RichEditor>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [roleNameError, setRoleNameError] = useState<string>();
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDateType, setSelectedDateType] = useState<
    'start' | 'end' | null
  >(null);

  const [selectedPriority, setSelectedPriority] = useState<string>(
    priorities[0] || 'low',
  );
  const [storyAttachment, setStoryAttachment] =
    useState<StoryAttachmentFile | null>(null);
  const [storyPoints, setStoryPoints] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'priority' | null>(null);

  const [localSnackbarVisible, setLocalSnackbarVisible] = useState(false);
  const [localSnackbarMessage, setLocalSnackbarMessage] = useState('');
  const [localSnackbarType, setLocalSnackbarType] =
    useState<SnackbarType>('error');

  const showLocalSnackbar = (message: string, type: SnackbarType = 'error') => {
    setLocalSnackbarMessage(message);
    setLocalSnackbarType(type);
    setLocalSnackbarVisible(true);
  };

  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.auth?.loading);
  const isRole = mode === 'role';
  const isSprint = mode === 'sprint';
  const isStory = mode === 'story';

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

  // Clear rich editor HTML when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        editorRef.current?.setContentHTML('');
      }, 150);
    }
  }, [visible]);

  const handleProjectSuccess = (successMsg?: string) => {
    dispatch(handleLoading(false));
    dispatch(resetProjects());
    dispatch(
      getAllProjectInfo({
        page: 1,
        page_size: 10,
      }),
    );
    dispatch(projectApi.util.invalidateTags(['Projects']));
    const msg = successMsg || 'Project created successfully';
    onSuccess?.(msg);
    handleClose();
    showSnackbar?.({
      message: msg,
      type: 'success',
    });
  };

  const handleClose = () => {
    setProjectName('');
    setProjectDescription('');
    editorRef.current?.setContentHTML('');
    setSprintGoal('');
    setStartDate('');
    setEndDate('');
    setRoleNameError(undefined);
    setSelectedPriority(priorities[0] || 'medium');
    setStoryAttachment(null);
    setStoryPoints('');
    setActiveDropdown(null);
    setLocalSnackbarVisible(false);
    dispatch(handleLoading(false));
    onClose();
  };

  const handleSelectStoryAttachment = async () => {
    try {
      const files = await pick({
        type: [
          types.images,
          types.pdf,
          types.docx,
          types.xlsx,
          types.zip,
          types.plainText,
        ],
        allowMultiSelection: false,
      });
      const file = files[0];
      if (file?.uri) {
        setStoryAttachment({
          uri: file.uri,
          name: file.name || 'attachment',
          type: file.type || 'application/octet-stream',
          size: file.size ?? undefined,
        });
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        showLocalSnackbar('Unable to select attachment', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    const name = projectName.trim();
    if (!name) {
      const entityName = isSprint
        ? 'Sprint'
        : isRole
          ? 'Role'
          : isStory
            ? 'Story'
            : 'Project';
      showLocalSnackbar(`${entityName} name is required`, 'error');
      return;
    }

    if (isStory) {
      try {
        await onCreateStory?.(
          {
            title: name,
            description: projectDescription.trim(),
            priority: selectedPriority,
            story_points: Number(storyPoints) || 0,
            sprint_id: sprintId,
          },
          storyAttachment ?? undefined,
        );
        handleClose();
        const msg = 'User story created successfully';
        onSuccess?.(msg);
        showSnackbar?.({
          message: msg,
          type: 'success',
        });
      } catch (err: any) {
        const errorMsg =
          err?.data?.message || err?.message || 'Failed to create user story';
        showLocalSnackbar(errorMsg, 'error');
      }
      return;
    }

    if (isSprint) {
      if (!projectId) {
        showLocalSnackbar('Project ID is required to create sprint', 'error');
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
        onSuccess?.('Sprint created successfully');
        showSnackbar?.({
          message: 'Sprint created successfully',
          type: 'success',
        });
      } catch (err: any) {
        const errorMsg =
          err?.data?.message || err?.message || 'Failed to create sprint';
        showLocalSnackbar(errorMsg, 'error');
      }
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
      } catch (err: any) {
        // Keep modal open on error
        const errorMsg =
          err?.data?.message || err?.message || 'Failed to create role';
        showLocalSnackbar(errorMsg, 'error');
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
        handleSuccess: handleProjectSuccess,
        handleError: (errMsg?: string) => {
          showLocalSnackbar(errMsg || 'Failed to create project', 'error');
        },
      }),
    );
  };

  const toolbarActions = [
    actions.heading1,
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.insertBulletsList,
    actions.insertOrderedList,
    actions.hiliteColor,
    actions.insertLink,
    actions.undo,
    actions.redo,
  ];

  const isSubmitting =
    loading || isCreatingRole || isCreatingSprint || isCreatingStory;
  const isSubmitDisabled = !projectName.trim() || isSubmitting;

  const modalHeaderTitle =
    title ??
    (isSprint
      ? 'Create Sprint'
      : isRole
        ? 'Create Role'
        : isStory
          ? 'Create Story'
          : 'New Project');

  const actionButtonText = isSprint
    ? 'Create Sprint'
    : isRole
      ? 'Create Role'
      : isStory
        ? 'Create Story'
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
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingTop: Math.max(insets.top, moderateScale(24)),
              paddingBottom: Math.max(insets.bottom, moderateScale(24)),
            }}
          >
            <TouchableWithoutFeedback onPress={() => setActiveDropdown(null)}>
              <View
                className='w-full rounded-2xl shadow-xl'
                style={{
                  backgroundColor: colors.surface || colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  maxWidth: moderateScale(420),
                  borderRadius: Radius.lg || moderateScale(16),
                  overflow: 'hidden',
                  maxHeight: '100%',
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
                    paddingBottom: moderateScale(24),
                    gap: isSmallHeight ? moderateScale(12) : moderateScale(16),
                  }}
                >
                  {/* Field 1: Title / Name */}
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
                            : isStory
                              ? 'Story title '
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

                    <AppInput
                      value={projectName}
                      onChangeText={text => {
                        setProjectName(text);
                        if (isRole) {
                          setRoleNameError(
                            text.trim() ? validateRoleName?.(text) : undefined,
                          );
                        }
                      }}
                      placeholder={
                        isSprint
                          ? 'Enter sprint name...'
                          : isRole
                            ? 'Enter role name...'
                            : isStory
                              ? 'Enter story title...'
                              : 'e.g. WorkPilot Mobile App'
                      }
                      onFocus={() => {
                        setActiveDropdown(null);
                      }}
                      onBlur={() => {}}
                      error={roleNameError}
                    />
                  </View>

                  {/* Field 2: Description (Project & Story modes using RichEditor) */}
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
                          borderWidth: 1,
                          borderColor: colors.border || '#E2E8F0',
                          borderRadius: Radius.md,
                          backgroundColor: colors.surface,
                          overflow: 'hidden',
                        }}
                      >
                        {/* Top Rich Toolbar */}
                        <View
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border || '#E2E8F0',
                            backgroundColor: colors.card || colors.surface,
                          }}
                        >
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps='always'
                            contentContainerStyle={{ alignItems: 'center' }}
                          >
                            <RichToolbar
                              editor={editorRef}
                              getEditor={() => editorRef.current}
                              actions={toolbarActions}
                              iconTint={colors.textSecondary}
                              selectedIconTint={colors.primary}
                              style={{
                                backgroundColor: 'transparent',
                                minHeight: 40,
                              }}
                            />
                          </ScrollView>
                        </View>

                        {/* Rich Editor */}
                        <RichEditor
                          ref={editorRef}
                          initialContentHTML=''
                          placeholder={
                            isStory
                              ? 'Enter story details...'
                              : 'Briefly describe the project goal and scope...'
                          }
                          onChange={html => setProjectDescription(html)}
                          onFocus={() => setActiveDropdown(null)}
                          useContainer={true}
                          style={{
                            minHeight: moderateScale(100),
                            maxHeight: moderateScale(180),
                          }}
                          editorStyle={{
                            backgroundColor: colors.surface,
                            color: colors.text,
                            placeholderColor:
                              colors.placeholder || colors.textSecondary,
                            contentCSSText: `
                              font-size: ${layout?.bodyFontSize || 14}px;
                              padding: 10px;
                              outline: none;
                              -webkit-user-select: text;
                              user-select: text;
                            `,
                          }}
                        />
                      </View>
                    </View>
                  )}

                  {isStory && (
                    <View style={{ gap: moderateScale(6) }}>
                      <AppText
                        variant='body'
                        color={colors.text}
                        style={{
                          fontWeight: '600',
                          fontSize: moderateScale(14),
                        }}
                      >
                        Attachment
                      </AppText>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSelectStoryAttachment}
                        style={{
                          minHeight: moderateScale(42),
                          paddingHorizontal: moderateScale(12),
                          paddingVertical: moderateScale(10),
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: moderateScale(8),
                          borderWidth: 1,
                          borderColor: colors.border || '#E2E8F0',
                          borderRadius: Radius.sm || moderateScale(8),
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Ionicons
                          name='attach-outline'
                          size={moderateScale(18)}
                          color={colors.primary}
                        />
                        <AppText
                          variant='caption'
                          color={
                            storyAttachment ? colors.text : colors.textSecondary
                          }
                          numberOfLines={1}
                          style={{ flex: 1 }}
                        >
                          {storyAttachment?.name || 'Choose a file'}
                        </AppText>
                        {storyAttachment && (
                          <TouchableOpacity
                            onPress={event => {
                              event.stopPropagation();
                              setStoryAttachment(null);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name='close-circle'
                              size={moderateScale(18)}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Story Specific Controls: Priority and Story Points */}
                  {isStory &&
                    (() => {
                      const formattedPriorities: DropdownItem<string>[] =
                        TASK_PRIORITY_OPTIONS.map(opt => ({
                          id: opt,
                          name: getPriorityLabel(opt),
                          color:
                            getPriorityThemeColor(opt, colors) ||
                            colors.primary,
                        }));

                      return (
                        <View
                          className='flex-row items-end'
                          style={{
                            gap: layout?.elementGap || moderateScale(8),
                            zIndex: activeDropdown ? 50 : 1,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <CustomDropdown
                              label='Priority'
                              width='100%'
                              items={formattedPriorities}
                              selectedValue={selectedPriority}
                              isOpen={activeDropdown === 'priority'}
                              onToggle={() =>
                                setActiveDropdown(prev =>
                                  prev === 'priority' ? null : 'priority',
                                )
                              }
                              onSelect={item => {
                                setSelectedPriority(String(item.id));
                                setActiveDropdown(null);
                              }}
                              direction='up'
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <AppInput
                              label='Story Points'
                              value={storyPoints}
                              onChangeText={setStoryPoints}
                              placeholder='0'
                              keyboardType='numeric'
                              onFocus={() => setActiveDropdown(null)}
                            />
                          </View>
                        </View>
                      );
                    })()}

                  {/* Sprint Fields (Goal & Dates) */}
                  {isSprint && (
                    <>
                      <View style={{ gap: moderateScale(6) }}>
                        <AppInput
                          label='Sprint Goal'
                          value={sprintGoal}
                          onChangeText={setSprintGoal}
                          placeholder='Enter sprint goal...'
                        />
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
                </ScrollView>

                {/* Footer Buttons Section */}
                <View
                  className='flex-row items-center justify-end'
                  style={{
                    paddingHorizontal: moderateScale(20),
                    paddingVertical: moderateScale(16),
                    gap: moderateScale(12),
                    backgroundColor: colors.card || colors.surface,
                    borderBottomRightRadius: Radius.lg || moderateScale(16),
                    borderBottomLeftRadius: Radius.lg || moderateScale(16),
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
      {/* In-Modal Snackbar so error/validation messages appear on top of CreateProjectModal on Android */}
      <CustomSnackbar
        visible={localSnackbarVisible}
        onDismiss={() => setLocalSnackbarVisible(false)}
        message={localSnackbarMessage}
        type={localSnackbarType}
        duration={3500}
        bottomOffset={Math.max(insets.bottom, moderateScale(20))}
      />
    </Modal>
  );
};

export default CreateProjectModal;
