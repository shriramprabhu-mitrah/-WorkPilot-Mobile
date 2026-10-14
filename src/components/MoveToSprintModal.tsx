import React, { useState, useEffect } from 'react';
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { useGetSprintsQuery } from '../store/api/projectApi';
import {
  useUpdateUserStoryMutation,
  useUpdateTaskMutation,
} from '../store/api/userStoryApi';
import { showSnackbar } from './common/Snackbar';
import { Sprint } from '../types/project.type';
import { useAppDispatch, useAppSelector } from '../store';
import { getCurrentSprintData } from '../store/project_store/reducer/project_reducer';

interface MoveToSprintModalProps {
  visible: boolean;
  itemId?: string;
  itemTitle?: string;
  itemFormattedSerial?: string;
  itemType: 'story' | 'task';
  projectId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveToSprintModal: React.FC<MoveToSprintModalProps> = ({
  visible,
  itemId,
  itemTitle,
  itemFormattedSerial,
  itemType,
  projectId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { currentSprint } = useAppSelector(state => state.projects);
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const {
    data: sprintsResponse,
    isLoading: isSprintsLoading,
    refetch: refetchSprints,
  } = useGetSprintsQuery(
    projectId ? { project_id: projectId } : ({} as any),
    { skip: !visible || !projectId },
  );

  const [updateUserStory, { isLoading: isUpdatingStory }] =
    useUpdateUserStoryMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();

  const isSubmitting = isUpdatingStory || isUpdatingTask;

  const rawSprints = Array.isArray(sprintsResponse?.data)
    ? (sprintsResponse.data as Sprint[])
    : [];

  useEffect(() => {
    if (visible) {
      if (projectId) {
        refetchSprints();
      }
    } else {
      setSelectedSprintId(null);
    }
  }, [visible, projectId, refetchSprints]);

  useEffect(() => {
    if (visible && rawSprints.length > 0 && !selectedSprintId) {
      const activeSprint =
        rawSprints.find(s => s.id === currentSprint?.id) ||
        rawSprints.find(
          s =>
            s.status?.toLowerCase() === 'active' ||
            s.status?.toLowerCase() === 'in_progress',
        ) ||
        rawSprints[0];

      if (activeSprint) {
        setSelectedSprintId(activeSprint.id);
      }
    }
  }, [visible, rawSprints, currentSprint?.id, selectedSprintId]);

  const handleConfirmMove = async () => {
    if (!selectedSprintId || !itemId || !projectId) {
      showSnackbar({
        message: 'Please select a sprint',
        type: 'error',
      });
      return;
    }

    try {
      if (itemType === 'story') {
        await updateUserStory({
          projectId,
          userStoryId: itemId,
          payload: { sprint_id: selectedSprintId },
        }).unwrap();
      } else {
        await updateTask({
          projectId,
          taskId: itemId,
          payload: { sprint_id: selectedSprintId },
        }).unwrap();
      }

      const targetSprint = rawSprints.find(s => s.id === selectedSprintId);
      if (targetSprint) {
        dispatch(getCurrentSprintData(targetSprint));
      }

      showSnackbar({
        message: `${itemType === 'story' ? 'User story' : 'Task'} moved to sprint successfully`,
        type: 'success',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.data?.message || err?.message || 'Failed to move to sprint',
        type: 'error',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={isSubmitting ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={isSubmitting ? undefined : onClose}>
        <View
          className='flex-1 items-center justify-center p-4'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        >
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              className='w-full max-w-sm rounded-2xl border p-5'
              style={{
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                borderRadius: Radius.lg,
              }}
            >
              {/* Header */}
              <View className='flex-row items-center justify-between pb-3'>
                <View className='flex-row items-center gap-2'>
                  <View
                    className='items-center justify-center rounded-lg p-2'
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Ionicons
                      name='arrow-redo'
                      size={moderateScale(18)}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant='body'
                    className='text-base font-bold'
                    color={colors.text}
                  >
                    Move to Sprint
                  </AppText>
                </View>
                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name='close'
                    size={moderateScale(20)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Item Info Box */}
              {(itemFormattedSerial || itemTitle) && (
                <View
                  className='mb-4 rounded-lg p-2.5'
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                >
                  {itemFormattedSerial && (
                    <AppText
                      variant='caption'
                      className='text-[11px] font-bold'
                      color={colors.primary}
                    >
                      {itemFormattedSerial}
                    </AppText>
                  )}
                  {itemTitle && (
                    <AppText
                      variant='body'
                      className='text-xs font-semibold'
                      color={colors.text}
                      numberOfLines={2}
                    >
                      {itemTitle}
                    </AppText>
                  )}
                </View>
              )}

              {/* Sprints list */}
              <AppText
                variant='caption'
                className='mb-2 font-semibold'
                color={colors.textSecondary}
              >
                Select Target Sprint
              </AppText>

              {isSprintsLoading ? (
                <View className='items-center justify-center py-8'>
                  <ActivityIndicator size='small' color={colors.primary} />
                </View>
              ) : rawSprints.length === 0 ? (
                <View className='items-center justify-center rounded-lg py-6'>
                  <Ionicons
                    name='folder-open-outline'
                    size={moderateScale(32)}
                    color={colors.textSecondary}
                  />
                  <AppText
                    variant='caption'
                    className='mt-2 text-center'
                    color={colors.textSecondary}
                  >
                    No sprints found for this project. Please create a sprint first.
                  </AppText>
                </View>
              ) : (
                <View style={{ maxHeight: moderateScale(220) }}>
                  <FlatList
                    data={rawSprints}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                      const isSelected = selectedSprintId === item.id;
                      return (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedSprintId(item.id)}
                          className='mb-2 flex-row items-center justify-between rounded-lg border p-3'
                          style={{
                            backgroundColor: isSelected
                              ? `${colors.primary}10`
                              : colors.surface,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          }}
                        >
                          <View className='flex-1 mr-2'>
                            <AppText
                              variant='body'
                              className='text-sm font-semibold'
                              color={isSelected ? colors.primary : colors.text}
                              numberOfLines={1}
                            >
                              {item.name}
                            </AppText>
                            {item.status && (
                              <AppText
                                variant='caption'
                                className='text-[10px] capitalize'
                                color={colors.textSecondary}
                              >
                                {item.status}
                              </AppText>
                            )}
                          </View>
                          <Ionicons
                            name={
                              isSelected
                                ? 'radio-button-on'
                                : 'radio-button-off'
                            }
                            size={moderateScale(18)}
                            color={
                              isSelected ? colors.primary : colors.textSecondary
                            }
                          />
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}

              {/* Action Buttons */}
              <View className='mt-4 flex-row items-center gap-3'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                  onPress={onClose}
                  className='flex-1 items-center justify-center rounded-xl border py-2.5'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <AppText
                    variant='body'
                    className='text-sm font-semibold'
                    color={colors.textSecondary}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isSubmitting || !selectedSprintId}
                  onPress={handleConfirmMove}
                  className='flex-1 flex-row items-center justify-center rounded-xl py-2.5'
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isSubmitting || !selectedSprintId ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <AppText
                      variant='body'
                      className='text-sm font-bold'
                      color='#FFFFFF'
                    >
                      Confirm Move
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MoveToSprintModal;
