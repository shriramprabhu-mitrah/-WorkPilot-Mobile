import React, { useEffect, useState } from 'react';
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

  isUpdating?: boolean;
}

const STATUS_OPTIONS: {
  label: string;
  value: SprintStatus;
}[] = [
  {
    label: 'Planned',
    value: 'planned',
  },
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'On Hold',
    value: 'on_hold',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
  {
    label: 'Cancelled',
    value: 'cancelled',
  },
  {
    label: 'Archived',
    value: 'archived',
  },
];

const UpdateSprintModal: React.FC<UpdateSprintModalProps> = ({
  visible,
  onClose,
  sprint,
  onUpdate,
  isUpdating = false,
}) => {
  const { colors } = useTheme();
  const { isSmallHeight } = useAuthLayout();

  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<SprintStatus>('planned');

  const [selectedDateType, setSelectedDateType] = useState<
    'start' | 'end' | null
  >(null);

  const [localSnackbarVisible, setLocalSnackbarVisible] = useState(false);

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

    setSprintName(sprint.name ?? '');

    setSprintGoal(sprint.goal ?? '');

    setStartDate(sprint.start_date?.split('T')[0] ?? sprint.startDate ?? '');

    setEndDate(sprint.end_date?.split('T')[0] ?? sprint.endDate ?? '');

    setSelectedStatus((sprint.status as SprintStatus) ?? 'planned');
  }, [visible, sprint]);

  const showLocalSnackbar = (message: string, type: SnackbarType = 'error') => {
    setLocalSnackbarMessage(message);
    setLocalSnackbarType(type);
    setLocalSnackbarVisible(true);
  };

  const handleClose = () => {
    if (isUpdating) {
      return;
    }

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
    const name = sprintName.trim();
    const goal = sprintGoal.trim();

    // Validation
    if (!name) {
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
                    Edit Sprint
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

                  <View
                    style={{
                      gap: moderateScale(6),
                    }}
                  >
                    <AppInput
                      label='Sprint Goal'
                      value={sprintGoal}
                      onChangeText={setSprintGoal}
                      placeholder='Enter sprint goal...'
                      multiline
                      numberOfLines={3}
                      textAlignVertical='top'
                      style={{
                        minHeight: moderateScale(80),
                      }}
                    />
                  </View>

                  {/* Start Date */}

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
                      Start Date
                    </AppText>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedDateType('start')}
                      disabled={isUpdating}
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

                  {/* End Date */}

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
                      End Date
                    </AppText>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedDateType('end')}
                      disabled={isUpdating}
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

                  {/* Status */}

                  <View
                    style={{
                      gap: moderateScale(8),
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
                      Status
                    </AppText>

                    <View
                      className='flex-row flex-wrap'
                      style={{
                        gap: moderateScale(8),
                      }}
                    >
                      {STATUS_OPTIONS.map(option => {
                        const selected = selectedStatus === option.value;

                        return (
                          <TouchableOpacity
                            key={option.value}
                            activeOpacity={0.7}
                            onPress={() => setSelectedStatus(option.value)}
                            disabled={isUpdating}
                            style={{
                              borderWidth: 1,

                              borderColor: selected
                                ? colors.primary
                                : colors.border,

                              backgroundColor: selected
                                ? colors.primary
                                : colors.surface,

                              borderRadius: moderateScale(20),

                              paddingHorizontal: moderateScale(12),

                              paddingVertical: moderateScale(8),
                            }}
                          >
                            <AppText
                              variant='body'
                              color={
                                selected
                                  ? colors.white || '#FFFFFF'
                                  : colors.text
                              }
                              style={{
                                fontSize: moderateScale(12),

                                fontWeight: selected ? '600' : '500',
                              }}
                            >
                              {option.label}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
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

                      minWidth: moderateScale(120),

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
                        Update Sprint
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
          } else {
            setEndDate(date);
          }
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
