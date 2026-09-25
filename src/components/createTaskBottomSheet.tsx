import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import { showSnackbar } from './common/Snackbar';
import CustomSnackbar from './common/Snackbar/CustomSnackbar';
import {
  useGetProjectMembersQuery,
  useGetCustomStatusQuery,
} from '../store/api/projectApi';
import { useCreateTaskMutation } from '../store/api/userStoryApi';
import { ProjectMember } from '../types/project.type';
import { CustomStatus } from '../types/customstatus.type';

interface Props {
  visible: boolean;
  onClose: () => void;
  projectId?: string;
  userStoryId?: string;
  onSuccess?: () => void;
}

const TASK_TYPES = ['Bug', 'Feature', 'Task', 'Chore'];
const DEFAULT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const DEFAULT_STATUSES = [
  'Todo',
  'In Progress',
  'In Review',
  'Testing',
  'Completed',
  'Blocked',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_SECONDS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const CreateTaskBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  projectId,
  userStoryId,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);
  const editorRef = useRef<RichEditor>(null);

  // Form State
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('Task');
  const [description, setDescription] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<ProjectMember | null>(null);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todo');
  const [selectedStatusId, setSelectedStatusId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState('Low');
  const [estimatedHr, setEstimatedHr] = useState('');
  const [estimatedMin, setEstimatedMin] = useState('');
  const [actualHr, setActualHr] = useState('');
  const [actualMin, setActualMin] = useState('');
  const [storyPoints, setStoryPoints] = useState('');

  // Validation & Submit State
  const [taskNameTouched, setTaskNameTouched] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // In-Modal Snackbar State (so errors are displayed above the Modal on Android)
  const [localSnackbarVisible, setLocalSnackbarVisible] = useState(false);
  const [localSnackbarMessage, setLocalSnackbarMessage] = useState('');
  const [localSnackbarType, setLocalSnackbarType] = useState<
    'success' | 'error' | 'default'
  >('default');

  // Dropdown Visibility States
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isAnyDropdownOpen =
    typeDropdownOpen ||
    assigneeDropdownOpen ||
    statusDropdownOpen ||
    priorityDropdownOpen;

  // Date & Time Picker State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [timeString, setTimeString] = useState('00:00:00');
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (timePickerOpen) {
      const parts = (timeString || '00:00:00').split(':');
      const hIndex = HOURS.indexOf(parts[0] || '00');
      const mIndex = MINUTES_SECONDS.indexOf(parts[1] || '00');
      const sIndex = MINUTES_SECONDS.indexOf(parts[2] || '00');

      const timer = setTimeout(() => {
        if (hIndex > 0) {
          hoursScrollRef.current?.scrollTo({
            y: Math.max(0, (hIndex - 1) * 34),
            animated: true,
          });
        }
        if (mIndex > 0) {
          minutesScrollRef.current?.scrollTo({
            y: Math.max(0, (mIndex - 1) * 34),
            animated: true,
          });
        }
        if (sIndex > 0) {
          secondsScrollRef.current?.scrollTo({
            y: Math.max(0, (sIndex - 1) * 34),
            animated: true,
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timePickerOpen]);

  // API Queries & Mutations
  const { data: membersResponse, isLoading: membersLoading } =
    useGetProjectMembersQuery(
      projectId ? { project_id: projectId, page: 1, page_size: 50 } : ({} as any),
      { skip: !projectId || !visible },
    );

  const { data: customStatusResponse } = useGetCustomStatusQuery(
    projectId ? { project_id: projectId } : ({} as any),
    { skip: !projectId || !visible },
  );

  const [createTaskMutation, { isLoading: isSubmitting }] =
    useCreateTaskMutation();

  const members: ProjectMember[] = useMemo(() => {
    return (membersResponse?.data as ProjectMember[]) ?? [];
  }, [membersResponse?.data]);

  const filteredMembers = useMemo(() => {
    if (!assigneeSearchQuery.trim()) return members;
    const q = assigneeSearchQuery.toLowerCase();
    return members.filter(
      m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q),
    );
  }, [members, assigneeSearchQuery]);

  const availableStatuses = useMemo(() => {
    const customStatuses = (customStatusResponse?.data as CustomStatus[]) ?? [];
    if (customStatuses.length > 0) {
      return customStatuses.map(s => ({
        id: s.id,
        name: s.name,
      }));
    }
    return DEFAULT_STATUSES.map(name => ({
      id: undefined,
      name,
    }));
  }, [customStatusResponse]);

  // Set default status and status_id from API when available
  useEffect(() => {
    const customStatuses = (customStatusResponse?.data as CustomStatus[]) ?? [];
    if (customStatuses.length > 0 && !selectedStatusId) {
      const defaultStatus =
        customStatuses.find(s => s.is_default) ||
        customStatuses.find(s => s.name.toLowerCase() === 'todo') ||
        customStatuses[0];
      if (defaultStatus) {
        setSelectedStatus(defaultStatus.name);
        setSelectedStatusId(defaultStatus.id);
      }
    }
  }, [customStatusResponse, selectedStatusId]);

  // Form Validity
  const isFormValid = taskName.trim().length > 0 && !!taskType && !!priority;

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTaskName('');
      setTaskNameTouched(false);
      setHasAttemptedSubmit(false);
      setTaskType('Task');
      setDescription('');
      setSelectedAssignee(null);
      setAssigneeSearchQuery('');
      setSelectedStatus('Todo');
      setSelectedStatusId(undefined);
      setPriority('Low');
      setEstimatedHr('');
      setEstimatedMin('');
      setActualHr('');
      setActualMin('');
      setStoryPoints('');
      setSelectedDate(null);
      setCurrentCalendarMonth(new Date());
      setTimeString('00:00:00');
      setTypeDropdownOpen(false);
      setAssigneeDropdownOpen(false);
      setStatusDropdownOpen(false);
      setPriorityDropdownOpen(false);
      setDatePickerOpen(false);
      setTimePickerOpen(false);
      setTimeout(() => {
        editorRef.current?.setContentHTML('');
      }, 150);
    }
  }, [visible]);

  const closeAllDropdowns = () => {
    setTypeDropdownOpen(false);
    setAssigneeDropdownOpen(false);
    setStatusDropdownOpen(false);
    setPriorityDropdownOpen(false);
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentCalendarMonth]);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(
      new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() - 1,
        1,
      ),
    );
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(
      new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() + 1,
        1,
      ),
    );
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(
      currentCalendarMonth.getFullYear(),
      currentCalendarMonth.getMonth(),
      day,
    );
    setSelectedDate(newDate);
  };

  const handleConfirmDate = () => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setDatePickerOpen(false);
  };

  const formatSelectedDateTimeDisplay = () => {
    if (!selectedDate) return '';
    const dateStr = selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr} ${timeString}`;
  };

  const formatIsoDueDate = () => {
    if (!selectedDate) return undefined;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${timeString || '00:00:00'}Z`;
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Failed to create task';
    if (typeof err === 'string') return err;
    if (typeof err.data === 'string') return err.data;
    if (err.data?.message) {
      if (Array.isArray(err.data.message)) {
        return err.data.message.join(', ');
      }
      if (typeof err.data.message === 'string') {
        return err.data.message;
      }
      return JSON.stringify(err.data.message);
    }
    if (err.data?.error) {
      return typeof err.data.error === 'string'
        ? err.data.error
        : JSON.stringify(err.data.error);
    }
    if (err.data?.detail) {
      return typeof err.data.detail === 'string'
        ? err.data.detail
        : JSON.stringify(err.data.detail);
    }
    if (err.message) return err.message;
    return 'Failed to create task';
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    const trimmedTitle = taskName.trim();
    if (!trimmedTitle) {
      const msg = 'Task name is required';
      setLocalSnackbarMessage(msg);
      setLocalSnackbarType('error');
      setLocalSnackbarVisible(true);
      showSnackbar({
        message: msg,
        type: 'error',
      });
      return;
    }

    if (!projectId) {
      const msg = 'Project ID is missing';
      setLocalSnackbarMessage(msg);
      setLocalSnackbarType('error');
      setLocalSnackbarVisible(true);
      showSnackbar({
        message: msg,
        type: 'error',
      });
      return;
    }

    const estHrNum = parseFloat(estimatedHr) || 0;
    const estMinNum = parseFloat(estimatedMin) || 0;
    const totalEstHours = estHrNum + estMinNum / 60;

    const actHrNum = parseFloat(actualHr) || 0;
    const actMinNum = parseFloat(actualMin) || 0;
    const totalActHours = actHrNum + actMinNum / 60;

    const storyPointsNum = parseFloat(storyPoints) || 0;

    // Find status ID
    let finalStatusId = selectedStatusId;
    if (!finalStatusId) {
      const matched = availableStatuses.find(
        s => s.name.toLowerCase() === selectedStatus.toLowerCase(),
      );
      if (matched?.id) {
        finalStatusId = matched.id;
      }
    }

    const payload: any = {
      title: trimmedTitle,
      type: taskType.toLowerCase(),
      description: description || '',
      priority: priority.toLowerCase(),
      user_story_id: userStoryId,
      estimated_hours: totalEstHours,
      actual_hours: totalActHours,
      story_points: storyPointsNum,
    };

    if (selectedAssignee?.user_id) {
      payload.assignee_id = selectedAssignee.user_id;
    }

    if (finalStatusId) {
      payload.status_id = finalStatusId;
    }

    const isoDate = formatIsoDueDate();
    if (isoDate) {
      payload.due_date = isoDate;
    }

    try {
      const response = await createTaskMutation({
        projectId,
        payload,
      }).unwrap();

      // 1. First close the bottomsheet on success
      onClose();
      // 2. Refresh parent list
      onSuccess?.();
      // 3. Show success message in snackbar on parent screen
      showSnackbar({
        message: (response as any)?.message || 'Task created successfully',
        type: 'success',
      });
    } catch (error: any) {
      // Keep bottomsheet open on error and show failure message in snackbar inside the Modal
      const errorMsg = getErrorMessage(error);
      setLocalSnackbarMessage(errorMsg);
      setLocalSnackbarType('error');
      setLocalSnackbarVisible(true);
      showSnackbar({
        message: errorMsg,
        type: 'error',
      });
    }
  };

  const toolbarActions = [
    actions.heading1,
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.insertBulletsList,
    actions.insertOrderedList,
    actions.hiliteColor,
    actions.insertImage,
    actions.insertLink,
    actions.undo,
    actions.redo,
  ];

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className='flex-1 bg-black/60 justify-end'>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ height: Math.max(insets.top, moderateScale(30)) }} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: colors.card || colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            className='flex-row items-center justify-between border-b px-5 py-4'
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card || colors.surface,
            }}
          >
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='text-xl font-bold'
            >
              Add Task
            </AppText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name='close' size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <View style={{ flex: 1, position: 'relative' }}>

            <ScrollView
              className='flex-1'
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                paddingBottom: 40,
                gap: 16,
              }}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
            >
              {/* ROW 1: Task name & Type */}
              <View className='flex-row' style={{ gap: 12, zIndex: 60 }}>
                {/* Task Name */}
                <View style={{ flex: 1.2 }}>
                  <View className='mb-1.5 flex-row items-center'>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='font-bold'
                    >
                      Task name{' '}
                    </AppText>
                    <AppText variant='body' color={colors.error || '#FF3B30'}>
                      *
                    </AppText>
                  </View>
                  <TextInput
                    value={taskName}
                    onChangeText={text => {
                      setTaskName(text);
                      if (!taskNameTouched) setTaskNameTouched(true);
                    }}
                    onBlur={() => setTaskNameTouched(true)}
                    onFocus={closeAllDropdowns}
                    placeholder='Enter task name'
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor:
                        (hasAttemptedSubmit || taskNameTouched) &&
                        !taskName.trim()
                          ? (colors.error || '#FF3B30')
                          : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.text,
                      fontSize: 14,
                    }}
                  />
                  {(hasAttemptedSubmit || taskNameTouched) &&
                    !taskName.trim() && (
                      <AppText
                        variant='caption'
                        color={colors.error || '#FF3B30'}
                        style={{ fontSize: 11, marginTop: 4 }}
                      >
                        Task name is required
                      </AppText>
                    )}
                </View>

                {/* Type */}
                <View style={{ flex: 0.8, zIndex: 70 }}>
                  <View className='mb-1.5 flex-row items-center'>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='font-bold'
                    >
                      Type{' '}
                    </AppText>
                    <AppText variant='body' color={colors.error || '#FF3B30'}>
                      *
                    </AppText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      const willOpen = !typeDropdownOpen;
                      closeAllDropdowns();
                      setTypeDropdownOpen(willOpen);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: typeDropdownOpen
                        ? colors.primary
                        : hasAttemptedSubmit && !taskType
                          ? (colors.error || '#FF3B30')
                          : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <AppText
                      variant='body'
                      color={colors.text}
                      numberOfLines={1}
                    >
                      {taskType || 'Select type'}
                    </AppText>
                    <Ionicons
                      name={typeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {hasAttemptedSubmit && !taskType && (
                    <AppText
                      variant='caption'
                      color={colors.error || '#FF3B30'}
                      style={{ fontSize: 11, marginTop: 4 }}
                    >
                      Type is required
                    </AppText>
                  )}

                  {/* Type Dropdown Menu */}
                  {typeDropdownOpen && (
                    <>
                      <Pressable
                        onPress={() => setTypeDropdownOpen(false)}
                        style={{
                          position: 'absolute',
                          top: -600,
                          bottom: -600,
                          left: -600,
                          right: -600,
                          zIndex: 90,
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 70,
                          left: 0,
                          right: 0,
                          backgroundColor: colors.card || colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          zIndex: 100,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 10,
                          paddingVertical: 4,
                        }}
                      >
                        {TASK_TYPES.map(typeItem => {
                          const isSelected = taskType === typeItem;
                          return (
                            <TouchableOpacity
                              key={typeItem}
                              activeOpacity={0.7}
                              onPress={() => {
                                setTaskType(typeItem);
                                setTypeDropdownOpen(false);
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: isSelected
                                  ? `${colors.primary}10`
                                  : 'transparent',
                              }}
                            >
                              <AppText
                                variant='body'
                                color={isSelected ? colors.primary : colors.text}
                                className={isSelected ? 'font-semibold' : ''}
                              >
                                {typeItem}
                              </AppText>
                              {isSelected && (
                                <Ionicons
                                  name='checkmark'
                                  size={18}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* ROW 2: Description (HTML Rich Text Input) */}
              <View style={{ zIndex: 10 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: Radius.md,
                    backgroundColor: colors.surface,
                    overflow: 'hidden',
                  }}
                >
                  {/* Top Toolbar */}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
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
                          minHeight: 42,
                        }}
                      />
                    </ScrollView>
                  </View>

                  {/* Rich Editor */}
                  <RichEditor
                    ref={editorRef}
                    initialContentHTML=''
                    placeholder='Optional details...'
                    onChange={html => setDescription(html)}
                    onFocus={closeAllDropdowns}
                    useContainer={true}
                    style={{
                      minHeight: moderateScale(120),
                      maxHeight: moderateScale(200),
                    }}
                    editorStyle={{
                      backgroundColor: colors.surface,
                      color: colors.text,
                      placeholderColor: colors.textSecondary,
                      contentCSSText: `
                        font-size: ${layout.bodyFontSize}px;
                        padding: 10px;
                        outline: none;
                        -webkit-user-select: text;
                        user-select: text;
                      `,
                    }}
                  />
                </View>
              </View>

              {/* ROW 3: Assignee & Status */}
              <View className='flex-row' style={{ gap: 12, zIndex: 50 }}>
                {/* Assignee */}
                <View style={{ flex: 1, zIndex: 55 }}>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='mb-1.5 font-bold'
                  >
                    Assignee
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      const willOpen = !assigneeDropdownOpen;
                      closeAllDropdowns();
                      setAssigneeDropdownOpen(willOpen);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: assigneeDropdownOpen
                        ? colors.primary
                        : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {selectedAssignee && !assigneeDropdownOpen && (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: selectedAssignee.color || colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginRight: 6,
                        }}
                      >
                        {selectedAssignee.avatar_url ? (
                          <Image
                            source={{ uri: selectedAssignee.avatar_url }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode='cover'
                          />
                        ) : (
                          <AppText
                            variant='caption'
                            color='#FFF'
                            style={{ fontSize: 10, fontWeight: 'bold' }}
                          >
                            {(selectedAssignee.full_name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </AppText>
                        )}
                      </View>
                    )}
                    <TextInput
                      value={
                        assigneeDropdownOpen
                          ? assigneeSearchQuery
                          : selectedAssignee?.full_name || ''
                      }
                      onChangeText={text => {
                        setAssigneeSearchQuery(text);
                        if (!assigneeDropdownOpen) setAssigneeDropdownOpen(true);
                      }}
                      onFocus={() => {
                        closeAllDropdowns();
                        setAssigneeDropdownOpen(true);
                      }}
                      placeholder='Search assignee...'
                      placeholderTextColor={colors.textSecondary}
                      style={{
                        flex: 1,
                        padding: 0,
                        margin: 0,
                        color: colors.text,
                        fontSize: 14,
                      }}
                    />
                    {selectedAssignee && !assigneeDropdownOpen ? (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAssignee(null);
                          setAssigneeSearchQuery('');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name='close-circle'
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Ionicons
                        name={assigneeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textSecondary}
                      />
                    )}
                  </TouchableOpacity>

                  {/* Assignee Dropdown List */}
                  {assigneeDropdownOpen && (
                    <>
                      <Pressable
                        onPress={() => setAssigneeDropdownOpen(false)}
                        style={{
                          position: 'absolute',
                          top: -600,
                          bottom: -600,
                          left: -600,
                          right: -600,
                          zIndex: 90,
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 70,
                          left: 0,
                          right: 0,
                          backgroundColor: colors.card || colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          zIndex: 100,
                          maxHeight: moderateScale(200),
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 10,
                        }}
                      >
                        <ScrollView
                          nestedScrollEnabled
                          keyboardShouldPersistTaps='always'
                        >
                          {/* Option to clear / Unassigned */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                              setSelectedAssignee(null);
                              setAssigneeSearchQuery('');
                              setAssigneeDropdownOpen(false);
                            }}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                            }}
                          >
                            <AppText
                              variant='body'
                              color={!selectedAssignee ? colors.primary : colors.textSecondary}
                              className={!selectedAssignee ? 'font-semibold' : ''}
                            >
                              Unassigned
                            </AppText>
                          </TouchableOpacity>

                          {membersLoading ? (
                            <ActivityIndicator
                              size='small'
                              color={colors.primary}
                              style={{ padding: 12 }}
                            />
                          ) : filteredMembers.length === 0 ? (
                            <View style={{ padding: 12 }}>
                              <AppText
                                variant='caption'
                                color={colors.textSecondary}
                              >
                                No members found
                              </AppText>
                            </View>
                          ) : (
                            filteredMembers.map(m => {
                              const isSelected =
                                selectedAssignee?.user_id === m.user_id;
                              const initial = (m.full_name || m.username || 'U')
                                .charAt(0)
                                .toUpperCase();
                              return (
                                <TouchableOpacity
                                  key={m.user_id}
                                  activeOpacity={0.7}
                                  onPress={() => {
                                    setSelectedAssignee(m);
                                    setAssigneeSearchQuery(m.full_name);
                                    setAssigneeDropdownOpen(false);
                                  }}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    backgroundColor: isSelected
                                      ? `${colors.primary}10`
                                      : 'transparent',
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: m.color || colors.primary,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {m.avatar_url ? (
                                      <Image
                                        source={{ uri: m.avatar_url }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode='cover'
                                      />
                                    ) : (
                                      <AppText
                                        variant='caption'
                                        color='#FFF'
                                        className='text-xs font-bold'
                                      >
                                        {initial}
                                      </AppText>
                                    )}
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <AppText
                                      variant='body'
                                      color={
                                        isSelected ? colors.primary : colors.text
                                      }
                                      numberOfLines={1}
                                    >
                                      {m.full_name}
                                    </AppText>
                                    {m.role && (
                                      <AppText
                                        variant='caption'
                                        color={colors.textSecondary}
                                        style={{ fontSize: 11 }}
                                      >
                                        {m.role}
                                      </AppText>
                                    )}
                                  </View>
                                  {isSelected && (
                                    <Ionicons
                                      name='checkmark'
                                      size={16}
                                      color={colors.primary}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })
                          )}
                        </ScrollView>
                      </View>
                    </>
                  )}
                </View>

                {/* Status */}
                <View style={{ flex: 1, zIndex: 55 }}>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='mb-1.5 font-bold'
                  >
                    Status
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      const willOpen = !statusDropdownOpen;
                      closeAllDropdowns();
                      setStatusDropdownOpen(willOpen);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: statusDropdownOpen
                        ? colors.primary
                        : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <AppText
                      variant='body'
                      color={selectedStatus ? colors.text : colors.textSecondary}
                      numberOfLines={1}
                    >
                      {selectedStatus || 'Select status'}
                    </AppText>
                    <Ionicons
                      name={statusDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Status Dropdown Menu */}
                  {statusDropdownOpen && (
                    <>
                      <Pressable
                        onPress={() => setStatusDropdownOpen(false)}
                        style={{
                          position: 'absolute',
                          top: -600,
                          bottom: -600,
                          left: -600,
                          right: -600,
                          zIndex: 90,
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 70,
                          left: 0,
                          right: 0,
                          backgroundColor: colors.card || colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          zIndex: 100,
                          maxHeight: moderateScale(220),
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 10,
                        }}
                      >
                        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps='always'>
                          {availableStatuses.map(statusItem => {
                            const isSelected = selectedStatus === statusItem.name;
                            return (
                              <TouchableOpacity
                                key={statusItem.name}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setSelectedStatus(statusItem.name);
                                  setSelectedStatusId(statusItem.id);
                                  setStatusDropdownOpen(false);
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingHorizontal: 12,
                                  paddingVertical: 10,
                                  backgroundColor: isSelected
                                    ? `${colors.primary}10`
                                    : 'transparent',
                                }}
                              >
                                <AppText
                                  variant='body'
                                  color={
                                    isSelected ? colors.primary : colors.text
                                  }
                                  className={isSelected ? 'font-semibold' : ''}
                                >
                                  {statusItem.name}
                                </AppText>
                                {isSelected && (
                                  <Ionicons
                                    name='checkmark'
                                    size={18}
                                    color={colors.primary}
                                  />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* ROW 4: Due Date & Priority */}
              <View className='flex-row' style={{ gap: 12, zIndex: 40 }}>
                {/* Due Date */}
                <View style={{ flex: 1 }}>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='mb-1.5 font-bold'
                  >
                    Due Date
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      closeAllDropdowns();
                      setDatePickerOpen(true);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: datePickerOpen
                        ? colors.primary
                        : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons
                      name='calendar-outline'
                      size={18}
                      color={colors.textSecondary}
                    />
                    <AppText
                      variant='body'
                      color={selectedDate ? colors.text : colors.textSecondary}
                      numberOfLines={1}
                      style={{ flex: 1, fontSize: 13 }}
                    >
                      {formatSelectedDateTimeDisplay() ||
                        'Select due date and time'}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Priority */}
                <View style={{ flex: 1, zIndex: 45 }}>
                  <View className='mb-1.5 flex-row items-center'>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='font-bold'
                    >
                      Priority{' '}
                    </AppText>
                    <AppText variant='body' color={colors.error || '#FF3B30'}>
                      *
                    </AppText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      const willOpen = !priorityDropdownOpen;
                      closeAllDropdowns();
                      setPriorityDropdownOpen(willOpen);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: priorityDropdownOpen
                        ? colors.primary
                        : hasAttemptedSubmit && !priority
                          ? (colors.error || '#FF3B30')
                          : colors.border,
                      borderWidth: 1,
                      borderRadius: Radius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <AppText
                      variant='body'
                      color={colors.text}
                      numberOfLines={1}
                    >
                      {priority || 'Select priority'}
                    </AppText>
                    <Ionicons
                      name={priorityDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {hasAttemptedSubmit && !priority && (
                    <AppText
                      variant='caption'
                      color={colors.error || '#FF3B30'}
                      style={{ fontSize: 11, marginTop: 4 }}
                    >
                      Priority is required
                    </AppText>
                  )}

                  {/* Priority Dropdown Menu */}
                  {priorityDropdownOpen && (
                    <>
                      <Pressable
                        onPress={() => setPriorityDropdownOpen(false)}
                        style={{
                          position: 'absolute',
                          top: -600,
                          bottom: -600,
                          left: -600,
                          right: -600,
                          zIndex: 90,
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 70,
                          left: 0,
                          right: 0,
                          backgroundColor: colors.card || colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          zIndex: 100,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 10,
                          paddingVertical: 4,
                        }}
                      >
                        {DEFAULT_PRIORITIES.map(priorityItem => {
                          const isSelected = priority === priorityItem;
                          return (
                            <TouchableOpacity
                              key={priorityItem}
                              activeOpacity={0.7}
                              onPress={() => {
                                setPriority(priorityItem);
                                setPriorityDropdownOpen(false);
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: isSelected
                                  ? `${colors.primary}10`
                                  : 'transparent',
                              }}
                            >
                              <AppText
                                variant='body'
                                color={isSelected ? colors.primary : colors.text}
                                className={isSelected ? 'font-semibold' : ''}
                              >
                                {priorityItem}
                              </AppText>
                              {isSelected && (
                                <Ionicons
                                  name='checkmark'
                                  size={18}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* ROW 5: Estimated Hours & Actual Hours */}
              <View className='flex-row' style={{ gap: 12 }}>
                {/* Estimated Hours */}
                <View style={{ flex: 1 }}>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='mb-1.5 font-bold'
                  >
                    Estimated Hours
                  </AppText>
                  <View className='flex-row' style={{ gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        style={{ fontSize: 11, marginBottom: 2 }}
                      >
                        hr
                      </AppText>
                      <TextInput
                        value={estimatedHr}
                        onChangeText={setEstimatedHr}
                        onFocus={closeAllDropdowns}
                        keyboardType='numeric'
                        placeholder='0'
                        placeholderTextColor={colors.textSecondary}
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          color: colors.text,
                          fontSize: 14,
                          textAlign: 'center',
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        style={{ fontSize: 11, marginBottom: 2 }}
                      >
                        min
                      </AppText>
                      <TextInput
                        value={estimatedMin}
                        onChangeText={setEstimatedMin}
                        onFocus={closeAllDropdowns}
                        keyboardType='numeric'
                        placeholder='0'
                        placeholderTextColor={colors.textSecondary}
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          color: colors.text,
                          fontSize: 14,
                          textAlign: 'center',
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Actual Hours */}
                <View style={{ flex: 1 }}>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='mb-1.5 font-bold'
                  >
                    Actual Hours
                  </AppText>
                  <View className='flex-row' style={{ gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        style={{ fontSize: 11, marginBottom: 2 }}
                      >
                        hr
                      </AppText>
                      <TextInput
                        value={actualHr}
                        onChangeText={setActualHr}
                        onFocus={closeAllDropdowns}
                        keyboardType='numeric'
                        placeholder='0'
                        placeholderTextColor={colors.textSecondary}
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          color: colors.text,
                          fontSize: 14,
                          textAlign: 'center',
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        style={{ fontSize: 11, marginBottom: 2 }}
                      >
                        min
                      </AppText>
                      <TextInput
                        value={actualMin}
                        onChangeText={setActualMin}
                        onFocus={closeAllDropdowns}
                        keyboardType='numeric'
                        placeholder='0'
                        placeholderTextColor={colors.textSecondary}
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: Radius.md,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          color: colors.text,
                          fontSize: 14,
                          textAlign: 'center',
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* ROW 6: Story Points */}
              <View>
                <AppText
                  variant='body'
                  color={colors.text}
                  className='mb-1.5 font-bold'
                >
                  Story Points
                </AppText>
                <TextInput
                  value={storyPoints}
                  onChangeText={setStoryPoints}
                  onFocus={closeAllDropdowns}
                  keyboardType='numeric'
                  placeholder='0'
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: Radius.md,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 14,
                  }}
                />
              </View>
            </ScrollView>
          </View>

          {/* Footer Actions */}
          <View
            className='flex-row items-center justify-end border-t px-5'
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card || colors.surface,
              gap: 12,
              paddingTop: 12,
              paddingBottom: bottomPadding,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
              style={{
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: Radius.md,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: colors.surface,
              }}
            >
              <AppText variant='body' color={colors.textSecondary}>
                Cancel
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              activeOpacity={0.7}
              style={{
                borderRadius: Radius.md,
                paddingHorizontal: 24,
                paddingVertical: 10,
                backgroundColor: !isFormValid
                  ? `${colors.primary || '#0066FF'}50`
                  : (colors.primary || '#0066FF'),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 100,
                opacity: !isFormValid ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <AppText
                  variant='body'
                  color='#FFFFFF'
                  className='font-semibold'
                >
                  Save Task
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Date & Time Picker Modal (Screenshot 4) */}
      <Modal
        visible={datePickerOpen}
        transparent={true}
        animationType='fade'
        onRequestClose={() => {
          if (timePickerOpen) setTimePickerOpen(false);
          else setDatePickerOpen(false);
        }}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            paddingHorizontal: 16,
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          }}
        >
          {/* Backdrop Tap to Close */}
          <Pressable
            onPress={() => {
              if (timePickerOpen) {
                setTimePickerOpen(false);
              } else {
                setDatePickerOpen(false);
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Modal Card */}
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              backgroundColor: colors.card || colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {/* Month Navigation */}
            <View className='mb-3 flex-row items-center justify-between'>
              <TouchableOpacity
                onPress={handlePrevMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name='chevron-back'
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <AppText
                variant='body'
                color={colors.text}
                className='font-bold'
              >
                {currentCalendarMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </AppText>

              <TouchableOpacity
                onPress={handleNextMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View className='mb-2 flex-row justify-between'>
              {DAYS_OF_WEEK.map(d => (
                <AppText
                  key={d}
                  variant='caption'
                  color={colors.textSecondary}
                  style={{ width: 36, textAlign: 'center', fontWeight: '600' }}
                >
                  {d}
                </AppText>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
              }}
            >
              {calendarDays.map((dayNum, idx) => {
                if (dayNum === null) {
                  return (
                    <View
                      key={`empty-${idx}`}
                      style={{ width: '14.28%', height: 36 }}
                    />
                  );
                }

                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() ===
                    currentCalendarMonth.getMonth() &&
                  selectedDate.getFullYear() ===
                    currentCalendarMonth.getFullYear();

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    onPress={() => handleSelectDay(dayNum)}
                    style={{
                      width: '14.28%',
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected
                          ? colors.primary
                          : 'transparent',
                        backgroundColor: isSelected
                          ? `${colors.primary}15`
                          : 'transparent',
                      }}
                    >
                      <AppText
                        variant='body'
                        color={isSelected ? colors.primary : colors.text}
                        className={isSelected ? 'font-bold' : ''}
                      >
                        {dayNum}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Divider */}
            <View
              className='my-3'
              style={{ height: 1, backgroundColor: colors.border }}
            />

            {/* Time & Done row */}
            <View
              className='flex-row items-center justify-between'
              style={{ position: 'relative', zIndex: 50 }}
            >
              <View className='flex-row items-center' style={{ gap: 8 }}>
                <AppText variant='caption' color={colors.textSecondary}>
                  Time
                </AppText>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setTimePickerOpen(prev => !prev)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: timePickerOpen
                      ? colors.primary
                      : colors.border,
                    borderRadius: Radius.md,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    gap: 6,
                    backgroundColor: colors.surface,
                  }}
                >
                  <TextInput
                    value={timeString}
                    onChangeText={setTimeString}
                    placeholder='00:00:00'
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      color: colors.text,
                      fontSize: 12,
                      padding: 0,
                      minWidth: 55,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setTimePickerOpen(prev => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name='time-outline'
                      size={16}
                      color={timePickerOpen ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleConfirmDate}
                style={{
                  backgroundColor: colors.primary || '#0066FF',
                  borderRadius: Radius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <AppText
                  variant='caption'
                  color='#FFFFFF'
                  className='font-bold'
                >
                  Done
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Time Picker Popup & Backdrop - Rendered directly inside Modal Card for full touch dispatch */}
            {timePickerOpen && (
              <>
                <Pressable
                  onPress={() => setTimePickerOpen(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 900,
                    backgroundColor: 'transparent',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 58,
                    left: 16,
                    width: 205,
                    height: 175,
                    backgroundColor: colors.card || colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: Radius.md,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 30,
                    zIndex: 999,
                    flexDirection: 'row',
                    overflow: 'hidden',
                  }}
                >
                  {/* Hours Column */}
                  <View
                    style={{
                      flex: 1,
                      borderRightWidth: 1,
                      borderRightColor: colors.border,
                    }}
                  >
                    <ScrollView
                      ref={hoursScrollRef}
                      style={{ flex: 1 }}
                      contentContainerStyle={{ paddingVertical: 2 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps='always'
                      nestedScrollEnabled={true}
                    >
                      {HOURS.map(h => {
                        const isSelected =
                          (timeString.split(':')[0] || '00') === h;
                        return (
                          <TouchableOpacity
                            key={`h-${h}`}
                            activeOpacity={0.6}
                            onPress={() => {
                              const parts = (
                                timeString || '00:00:00'
                              ).split(':');
                              const m = parts[1] || '00';
                              const s = parts[2] || '00';
                              setTimeString(`${h}:${m}:${s}`);
                            }}
                            style={{
                              height: 34,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isSelected
                                ? `${colors.primary}20`
                                : 'transparent',
                            }}
                          >
                            <AppText
                              variant='caption'
                              color={
                                isSelected ? colors.primary : colors.text
                              }
                              style={{
                                fontWeight: isSelected ? 'bold' : 'normal',
                                fontSize: 13,
                              }}
                            >
                              {h}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Minutes Column */}
                  <View
                    style={{
                      flex: 1,
                      borderRightWidth: 1,
                      borderRightColor: colors.border,
                    }}
                  >
                    <ScrollView
                      ref={minutesScrollRef}
                      style={{ flex: 1 }}
                      contentContainerStyle={{ paddingVertical: 2 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps='always'
                      nestedScrollEnabled={true}
                    >
                      {MINUTES_SECONDS.map(m => {
                        const isSelected =
                          (timeString.split(':')[1] || '00') === m;
                        return (
                          <TouchableOpacity
                            key={`m-${m}`}
                            activeOpacity={0.6}
                            onPress={() => {
                              const parts = (
                                timeString || '00:00:00'
                              ).split(':');
                              const h = parts[0] || '00';
                              const s = parts[2] || '00';
                              setTimeString(`${h}:${m}:${s}`);
                            }}
                            style={{
                              height: 34,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isSelected
                                ? `${colors.primary}20`
                                : 'transparent',
                            }}
                          >
                            <AppText
                              variant='caption'
                              color={
                                isSelected ? colors.primary : colors.text
                              }
                              style={{
                                fontWeight: isSelected ? 'bold' : 'normal',
                                fontSize: 13,
                              }}
                            >
                              {m}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Seconds Column */}
                  <View style={{ flex: 1 }}>
                    <ScrollView
                      ref={secondsScrollRef}
                      style={{ flex: 1 }}
                      contentContainerStyle={{ paddingVertical: 2 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps='always'
                      nestedScrollEnabled={true}
                    >
                      {MINUTES_SECONDS.map(s => {
                        const isSelected =
                          (timeString.split(':')[2] || '00') === s;
                        return (
                          <TouchableOpacity
                            key={`s-${s}`}
                            activeOpacity={0.6}
                            onPress={() => {
                              const parts = (
                                timeString || '00:00:00'
                              ).split(':');
                              const h = parts[0] || '00';
                              const m = parts[1] || '00';
                              setTimeString(`${h}:${m}:${s}`);
                            }}
                            style={{
                              height: 34,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isSelected
                                ? `${colors.primary}20`
                                : 'transparent',
                            }}
                          >
                            <AppText
                              variant='caption'
                              color={
                                isSelected ? colors.primary : colors.text
                              }
                              style={{
                                fontWeight: isSelected ? 'bold' : 'normal',
                                fontSize: 13,
                              }}
                            >
                              {s}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* In-Modal Snackbar so error messages are visible on top of the modal on Android */}
      <CustomSnackbar
        visible={localSnackbarVisible}
        onDismiss={() => setLocalSnackbarVisible(false)}
        message={localSnackbarMessage}
        type={localSnackbarType}
        duration={3500}
        bottomOffset={bottomPadding + 10}
      />
    </Modal>
  );
};

export default CreateTaskBottomSheet;
