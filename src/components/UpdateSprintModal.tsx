import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';

import AppText from './common/AppText';
import AppInput from './common/Input/AppInput';
import DatePickerModal from './datePickerModel';
import CustomSnackbar, { SnackbarType } from './common/Snackbar/CustomSnackbar';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { CustomDropdown, DropdownItem } from './CustomDropdown';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import JiraLogo from '../assets/svg/splasScreenlogo';

export type SprintStatus =
  'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';

export interface UpdateSprintRequest {
  name?: string | null;
  goal?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: SprintStatus | null;
}

interface UpdateSprintModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'start' | 'update' | 'complete';

  sprint?: {
    id?: string;
    name?: string | null;
    goal?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;

    // In case your API response uses camelCase
    startDate?: string | null;
    endDate?: string | null;
  };

  onUpdate: (payload: UpdateSprintRequest) => Promise<void> | void;
  onStart?: (payload: {
    start_date: string;
    end_date: string;
  }) => Promise<void> | void;
  onComplete?: () => Promise<void> | void;

  isUpdating?: boolean;
  completedStoryCount?: number;
  inProgressStoryCount?: number;
  error?: string;
}

const UpdateSprintModal: React.FC<UpdateSprintModalProps> = ({
  visible,
  onClose,
  mode = 'update',
  sprint,
  onUpdate,
  onStart,
  onComplete,
  isUpdating = false,
  completedStoryCount = 0,
  inProgressStoryCount = 0,
  error: completeError,
}) => {
  const { colors } = useTheme();
  const { layout, isSmallHeight } = useAuthLayout();

  const sprintGoalEditorRef = useRef<RichEditor>(null);

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

  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<SprintStatus>('planned');
  const [activeDropdown, setActiveDropdown] = useState<
    'status' | 'duration' | null
  >(null);
  const [duration, setDuration] = useState<'1' | '2' | '3' | '4' | 'custom'>(
    '2',
  );

  const [selectedDateType, setSelectedDateType] = useState<
    'start' | 'end' | null
  >(null);

  const [localSnackbarVisible, setLocalSnackbarVisible] = useState(false);
  const durationItems: DropdownItem<typeof duration>[] = [
    { id: '1', name: '1 Week' },
    { id: '2', name: '2 Weeks' },
    { id: '3', name: '3 Weeks' },
    { id: '4', name: '4 Weeks' },
    { id: 'custom', name: 'Custom' },
  ];

  const [localSnackbarMessage, setLocalSnackbarMessage] = useState('');

  const [localSnackbarType, setLocalSnackbarType] =
    useState<SnackbarType>('error');

  /**
   * Populate form whenever modal opens
   */
  useEffect(() => {
    if (!visible || !sprint) {
      return;
    }
    if (mode === 'complete') {
      return;
    }
    if (mode === 'start') {
      const now = new Date();
      setSprintName(sprint?.name ?? '');
      setSprintGoal(sprint?.goal ?? '');
      setStartDate(now.toISOString());
      setDuration('2');
      const end = new Date(now);
      end.setDate(end.getDate() + 14);
      setEndDate(end.toISOString());
      sprintGoalEditorRef.current?.setContentHTML(sprint?.goal ?? '');
      return;
    }

    setSprintName(sprint.name ?? '');

    setSprintGoal(sprint.goal ?? '');

    setStartDate(sprint.start_date?.split('T')[0] ?? sprint.startDate ?? '');

    setEndDate(sprint.end_date?.split('T')[0] ?? sprint.endDate ?? '');

    setSelectedStatus((sprint.status as SprintStatus) ?? 'planned');

    setTimeout(() => {
      sprintGoalEditorRef.current?.setContentHTML(sprint.goal ?? '');
    }, 150);
  }, [visible, sprint, mode]);

  const parseSprintDate = (value: string) => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const normalized = new Date(value.slice(0, 19));
    if (!Number.isNaN(normalized.getTime())) return normalized;
    const dateOnly = new Date(value.slice(0, 10));
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
  };

  const formatDate = (value: string) => {
    const date = parseSprintDate(value);
    if (!date) return value;
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-US');
  };

  const formatTime = (value: string) => {
    const date = parseSprintDate(value);
    return (
      date?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) ?? ''
    );
  };

  const timeValue = (value: string) => {
    const date = parseSprintDate(value);
    return date
      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : '09:00';
  };

  const chooseDuration = (value: typeof duration) => {
    setDuration(value);
    if (value !== 'custom') {
      const end = new Date(startDate);
      end.setDate(end.getDate() + Number(value) * 7);
      setEndDate(end.toISOString());
    } else {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 7);
      setEndDate(end.toISOString());
    }
  };

  const showLocalSnackbar = (message: string, type: SnackbarType = 'error') => {
    setLocalSnackbarMessage(message);
    setLocalSnackbarType(type);
    setLocalSnackbarVisible(true);
  };

  const handleClose = () => {
    if (isUpdating) {
      return;
    }

    sprintGoalEditorRef.current?.setContentHTML('');
    setSprintName('');
    setSprintGoal('');
    setStartDate('');
    setEndDate('');
    setSelectedStatus('planned');
    setSelectedDateType(null);
    setLocalSnackbarVisible(false);

    onClose();
  };

  const handleSubmit = async () => {
    if (mode === 'complete') {
      await onComplete?.();
      return;
    }

    const name = sprintName.trim();
    const goal = sprintGoal.trim();

    // Validation
    if (mode === 'update' && !name) {
      showLocalSnackbar('Sprint name is required', 'error');
      return;
    }

    if (!startDate) {
      showLocalSnackbar('Start date is required', 'error');
      return;
    }

    if (!endDate) {
      showLocalSnackbar('End date is required', 'error');
      return;
    }

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      showLocalSnackbar('End date must be after start date', 'error');
      return;
    }

    if (mode === 'start') {
      try {
        await onStart?.({ start_date: startDate, end_date: endDate });
      } catch (error: any) {
        showLocalSnackbar(
          error?.data?.message || error?.message || 'Failed to start sprint',
        );
      }
      return;
    }
    if (!sprint) return;

    // Prepare original values
    const originalName = sprint.name ?? '';
    const originalGoal = sprint.goal ?? '';
    const originalStartDate = sprint.start_date ?? sprint.startDate ?? '';
    const originalEndDate = sprint.end_date ?? sprint.endDate ?? '';
    const originalStatus = sprint.status ?? 'planned';

    // Build payload with only changed fields
    const payload: UpdateSprintRequest = {};

    if (name !== originalName) {
      payload.name = name;
    }

    if (goal !== originalGoal) {
      payload.goal = goal || null;
    }

    if (startDate !== originalStartDate) {
      payload.start_date = startDate;
    }

    if (endDate !== originalEndDate) {
      payload.end_date = endDate;
    }

    if (selectedStatus !== originalStatus) {
      payload.status = selectedStatus;
    }

    // No changes detected
    if (Object.keys(payload).length === 0) {
      showLocalSnackbar('No changes detected', 'error');
      return;
    }

    try {
      await onUpdate(payload);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to update sprint';

      showLocalSnackbar(errorMessage, 'error');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        className='flex-1'
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View
            className='flex-1 items-center justify-center px-4'
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                className='w-full rounded-2xl shadow-xl'
                style={{
                  backgroundColor: colors.surface || colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  maxWidth: moderateScale(420),
                  maxHeight: '90%',
                  borderRadius: Radius.lg || moderateScale(16),
                  overflow: 'hidden',
                }}
              >
                {/* Header */}

                {mode === 'complete' ? (
                  <View style={{ position: 'relative' }}>
                    <View
                      style={{
                        height: moderateScale(145),
                        width: '100%',
                        backgroundColor: colors.primary,
                        position: 'relative',
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Svg
                        width='100%'
                        height='100%'
                        viewBox='0 0 400 180'
                        preserveAspectRatio='xMidYMid slice'
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                      >
                        <Defs>
                          <LinearGradient
                            id='headerGradient'
                            x1='0'
                            y1='0'
                            x2='1'
                            y2='1'
                          >
                            <Stop
                              offset='0'
                              stopColor='#FFFFFF'
                              stopOpacity={0.18}
                            />
                            <Stop
                              offset='1'
                              stopColor='#FFFFFF'
                              stopOpacity={0}
                            />
                          </LinearGradient>
                        </Defs>
                        <Path
                          d='M0 110 C100 40 200 180 400 65 L400 180 L0 180 Z'
                          fill='url(#headerGradient)'
                        />
                        <Path
                          d='M0 135 C120 65 230 200 400 90'
                          stroke='#FFFFFF'
                          strokeOpacity={0.15}
                          strokeWidth={2}
                          fill='none'
                        />
                      </Svg>
                      <JiraLogo
                        width={moderateScale(120)}
                        height={moderateScale(40)}
                      />
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClose}
                      disabled={isUpdating}
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        padding: 6,
                        zIndex: 20,
                      }}
                    >
                      <Ionicons
                        name='close'
                        size={moderateScale(22)}
                        color='#FFFFFF'
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
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
                      {mode === 'start' ? 'Start Sprint' : 'Edit Sprint'}
                    </AppText>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClose}
                      disabled={isUpdating}
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
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
                )}

                {/* Body */}

                <ScrollView
                  keyboardShouldPersistTaps='handled'
                  keyboardDismissMode={
                    Platform.OS === 'ios' ? 'interactive' : 'on-drag'
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: moderateScale(20),
                    paddingTop: moderateScale(18),
                    paddingBottom: moderateScale(24),
                    gap: isSmallHeight ? moderateScale(12) : moderateScale(16),
                  }}
                >
                  {mode === 'start' && (
                    <CustomDropdown
                      label='Duration'
                      items={durationItems}
                      selectedValue={duration}
                      onSelect={item => {
                        chooseDuration(item.id);
                        setActiveDropdown(null);
                      }}
                      isOpen={activeDropdown === 'duration'}
                      onToggle={() =>
                        setActiveDropdown(
                          activeDropdown === 'duration' ? null : 'duration',
                        )
                      }
                      placeholder='Select duration'
                      direction='down'
                    />
                  )}
                  {mode === 'update' && (
                    <>
                      {/* Sprint Name */}

                      <View
                        style={{
                          gap: moderateScale(6),
                        }}
                      >
                        <View className='flex-row items-center'>
                          <AppText
                            variant='body'
                            color={colors.text}
                            style={{
                              fontWeight: '600',
                              fontSize: moderateScale(14),
                            }}
                          >
                            Sprint name
                          </AppText>

                          <AppText
                            style={{
                              color: colors.error || '#EF4444',

                              fontWeight: 'bold',

                              fontSize: moderateScale(14),
                            }}
                          >
                            {' '}
                            *
                          </AppText>
                        </View>

                        <AppInput
                          value={sprintName}
                          onChangeText={setSprintName}
                          placeholder='Enter sprint name...'
                        />
                      </View>

                      {/* Sprint Goal */}

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
                            borderWidth: 1,
                            borderColor: colors.border || '#E2E8F0',
                            borderRadius: Radius.md,
                            backgroundColor: colors.surface,
                            overflow: 'hidden',
                          }}
                        >
                          {/* Toolbar */}
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
                                editor={sprintGoalEditorRef}
                                getEditor={() => sprintGoalEditorRef.current}
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

                          {/* Rich Text Area */}
                          <RichEditor
                            ref={sprintGoalEditorRef}
                            initialContentHTML={sprintGoal || ''}
                            placeholder='Enter sprint goal...'
                            onChange={html => setSprintGoal(html)}
                            useContainer={true}
                            style={{
                              minHeight: moderateScale(80),
                              maxHeight: moderateScale(160),
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
                    </>
                  )}

                  {mode === 'complete' && (
                    <>
                      <AppText
                        variant='body'
                        color={colors.text}
                        style={{
                          fontWeight: '600',
                          fontSize: moderateScale(16),
                        }}
                      >
                        Complete {sprint?.name ?? ''}
                      </AppText>

                      <AppText variant='body' color={colors.textSecondary}>
                        This sprint contains{' '}
                        <AppText
                          variant='body'
                          color={colors.text}
                          style={{ fontWeight: '600' }}
                        >
                          {completedStoryCount} completed user stories
                        </AppText>{' '}
                        and{' '}
                        <AppText
                          variant='body'
                          color={colors.text}
                          style={{ fontWeight: '600' }}
                        >
                          {inProgressStoryCount} user stories in progress.
                        </AppText>
                      </AppText>
                      <AppText variant='body' color={colors.textSecondary}>
                        - Completed user stories include stories in the Done
                        column.
                      </AppText>
                      <AppText variant='body' color={colors.textSecondary}>
                        - In progress includes stories that are not completed.
                      </AppText>

                      {!!completeError && (
                        <AppText
                          variant='caption'
                          color={colors.error || '#DC2626'}
                        >
                          {completeError}
                        </AppText>
                      )}
                    </>
                  )}

                  {mode !== 'complete' && (
                    <>
                      {/* Start Date and Time */}

                      <View
                        style={{
                          gap: moderateScale(6),
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
                          Start date
                        </AppText>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedDateType('start')}
                          disabled
                          style={{
                            backgroundColor: colors.card || colors.surface,
                            opacity: 0.72,

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
                          <Ionicons
                            name='calendar-outline'
                            size={moderateScale(18)}
                            color={colors.textSecondary || '#94A3B8'}
                          />
                          <AppText
                            style={{
                              flex: 1,
                              marginLeft: moderateScale(10),
                              fontSize: moderateScale(14),

                              color: startDate
                                ? colors.text
                                : colors.placeholder || '#94A3B8',
                            }}
                          >
                            {startDate ? formatDate(startDate) : 'Select date'}
                          </AppText>
                          <AppText
                            style={{
                              fontSize: moderateScale(14),
                              color: colors.textSecondary,
                            }}
                          >
                            {formatTime(startDate)}
                          </AppText>
                        </TouchableOpacity>
                      </View>

                      {/* End Date and Time */}

                      <View
                        style={{
                          gap: moderateScale(6),
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
                          End date
                        </AppText>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedDateType('end')}
                          disabled={
                            isUpdating ||
                            (mode === 'start' && duration !== 'custom')
                          }
                          style={{
                            backgroundColor:
                              isUpdating ||
                              (mode === 'start' && duration !== 'custom')
                                ? colors.card || colors.surface
                                : colors.surface,
                            opacity:
                              isUpdating ||
                              (mode === 'start' && duration !== 'custom')
                                ? 0.72
                                : 1,
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
                          <Ionicons
                            name='calendar-outline'
                            size={moderateScale(18)}
                            color={colors.textSecondary || '#94A3B8'}
                          />
                          <AppText
                            style={{
                              flex: 1,
                              marginLeft: moderateScale(10),
                              fontSize: moderateScale(14),
                              color: endDate
                                ? colors.text
                                : colors.placeholder || '#94A3B8',
                            }}
                          >
                            {endDate ? formatDate(endDate) : 'Select date'}
                          </AppText>
                          <AppText
                            style={{
                              fontSize: moderateScale(14),
                              color: colors.textSecondary,
                            }}
                          >
                            {formatTime(endDate)}
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </ScrollView>

                {/* Footer */}

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
                    disabled={isUpdating}
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
                    disabled={isUpdating}
                    onPress={handleSubmit}
                    style={{
                      backgroundColor: isUpdating
                        ? '#94A3B8'
                        : colors.primary || '#0E6FFF',

                      borderRadius: Radius.sm || moderateScale(8),

                      paddingVertical: moderateScale(8),

                      paddingHorizontal: moderateScale(16),

                      minWidth:
                        mode === 'complete'
                          ? moderateScale(145)
                          : moderateScale(120),

                      alignItems: 'center',

                      justifyContent: 'center',
                    }}
                  >
                    {isUpdating ? (
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
                        {mode === 'start'
                          ? 'Start Sprint'
                          : mode === 'complete'
                            ? 'Complete sprint'
                            : 'Update Sprint'}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Date Picker */}

      <DatePickerModal
        visible={selectedDateType === 'end'}
        title={
          mode === 'start'
            ? 'Set Sprint End Date and Time'
            : 'Update Sprint End Date and Time'
        }
        selectedDate={endDate.slice(0, 10)}
        selectedTime={timeValue(endDate)}
        minDate={startDate.slice(0, 10)}
        showTimePicker
        onClose={() => setSelectedDateType(null)}
        onSelectDate={date => setEndDate(date)}
        onSelectDateTime={(date, time) => {
          const [year, month, day] = date.split('-').map(Number);
          const [hour, minute] = time.split(':').map(Number);
          setEndDate(
            new Date(year, month - 1, day, hour, minute).toISOString(),
          );
        }}
      />

      {/* Snackbar */}

      <CustomSnackbar
        visible={localSnackbarVisible}
        onDismiss={() => setLocalSnackbarVisible(false)}
        message={localSnackbarMessage}
        type={localSnackbarType}
        duration={3500}
        bottomOffset={moderateScale(20)}
      />
    </Modal>
  );
};

export default UpdateSprintModal;
