import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import {
  useLazyGetSprintsQuery,
  useLazyGetUserStoriesQuery,
} from '../store/api/projectApi';
import {
  useUpdateUserStoryMutation,
  useUpdateTaskMutation,
} from '../store/api/userStoryApi';
import { showSnackbar } from './common/Snackbar';
import { Sprint, UserStory } from '../types/project.type';

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
  const { colors } = useTheme();
  const { moderateScale, hp } = useAuthLayout();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  // Task-specific states
  const [isStoryless, setIsStoryless] = useState<boolean | null>(null);
  const [selectedUserStoryId, setSelectedUserStoryId] = useState<string | null>(
    null,
  );

  // Sprints pagination states (page_size: 3)
  const [triggerGetSprints] = useLazyGetSprintsQuery();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintsPage, setSprintsPage] = useState(1);
  const [hasMoreSprints, setHasMoreSprints] = useState(true);
  const [isSprintsLoading, setIsSprintsLoading] = useState(false);
  const [isFetchingMoreSprints, setIsFetchingMoreSprints] = useState(false);

  // User stories pagination states (page_size: 3)
  const [triggerGetUserStories] = useLazyGetUserStoriesQuery();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [storiesPage, setStoriesPage] = useState(1);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isStoriesLoading, setIsStoriesLoading] = useState(false);
  const [isFetchingMoreStories, setIsFetchingMoreStories] = useState(false);

  const [updateUserStory, { isLoading: isUpdatingStory }] =
    useUpdateUserStoryMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();

  const isSubmitting = isUpdatingStory || isUpdatingTask;

  // Initial fetch for sprints when modal opens
  useEffect(() => {
    if (visible && projectId) {
      let isMounted = true;
      const fetchInitialSprints = async () => {
        setIsSprintsLoading(true);
        setSprintsPage(1);
        setHasMoreSprints(true);
        try {
          const res = await triggerGetSprints({
            project_id: projectId,
            page: 1,
            page_size: 3,
          }).unwrap();
          if (!isMounted) return;
          const list = Array.isArray(res?.data) ? (res.data as Sprint[]) : [];
          setSprints(list);
          setHasMoreSprints(res?.meta?.has_next ?? (list.length === 3));

          const activeSprint =
            list.find(
              s =>
                s.status?.toLowerCase() === 'active' ||
                s.status?.toLowerCase() === 'in_progress',
            ) || list[0];
          if (activeSprint) {
            setSelectedSprintId(activeSprint.id);
          }
        } catch (err) {
          console.error('Failed to fetch initial sprints:', err);
        } finally {
          if (isMounted) setIsSprintsLoading(false);
        }
      };

      fetchInitialSprints();

      return () => {
        isMounted = false;
      };
    } else if (!visible) {
      setSprints([]);
      setSprintsPage(1);
      setHasMoreSprints(true);
      setSelectedSprintId(null);
      setIsStoryless(null);
      setSelectedUserStoryId(null);
      setStories([]);
      setStoriesPage(1);
      setHasMoreStories(true);
    }
  }, [visible, projectId, triggerGetSprints]);

  // Load more sprints on scroll
  const handleLoadMoreSprints = useCallback(async () => {
    if (
      isSprintsLoading ||
      isFetchingMoreSprints ||
      !hasMoreSprints ||
      !projectId
    ) {
      return;
    }
    try {
      setIsFetchingMoreSprints(true);
      const nextPage = sprintsPage + 1;
      const res = await triggerGetSprints({
        project_id: projectId,
        page: nextPage,
        page_size: 3,
      }).unwrap();

      const newItems = Array.isArray(res?.data) ? (res.data as Sprint[]) : [];
      if (newItems.length > 0) {
        setSprints(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const filtered = newItems.filter(s => !existingIds.has(s.id));
          return [...prev, ...filtered];
        });
        setSprintsPage(nextPage);
      }
      setHasMoreSprints(res?.meta?.has_next ?? (newItems.length === 3));
    } catch (err) {
      console.error('Failed to load more sprints:', err);
    } finally {
      setIsFetchingMoreSprints(false);
    }
  }, [
    isSprintsLoading,
    isFetchingMoreSprints,
    hasMoreSprints,
    projectId,
    sprintsPage,
    triggerGetSprints,
  ]);

  // Initial fetch for user stories when sprint is selected & isStoryless === false
  useEffect(() => {
    if (
      visible &&
      projectId &&
      selectedSprintId &&
      itemType === 'task' &&
      isStoryless === false
    ) {
      let isMounted = true;
      const fetchInitialStories = async () => {
        setIsStoriesLoading(true);
        setStoriesPage(1);
        setHasMoreStories(true);
        try {
          const res = await triggerGetUserStories({
            projectId,
            payload: {
              sprint_id: selectedSprintId,
              page: 1,
              page_size: 3,
              sort_by: 'created_at',
              sort_order: 'DESC',
            },
          }).unwrap();
          if (!isMounted) return;
          const list = Array.isArray(res?.data) ? (res.data as UserStory[]) : [];
          setStories(list);
          setHasMoreStories(res?.meta?.has_next ?? (list.length === 3));
        } catch (err) {
          console.error('Failed to fetch initial stories:', err);
        } finally {
          if (isMounted) setIsStoriesLoading(false);
        }
      };

      fetchInitialStories();

      return () => {
        isMounted = false;
      };
    } else {
      setStories([]);
      setStoriesPage(1);
      setHasMoreStories(true);
      setSelectedUserStoryId(null);
    }
  }, [
    visible,
    projectId,
    selectedSprintId,
    itemType,
    isStoryless,
    triggerGetUserStories,
  ]);

  // Load more user stories on scroll
  const handleLoadMoreStories = useCallback(async () => {
    if (
      isStoriesLoading ||
      isFetchingMoreStories ||
      !hasMoreStories ||
      !projectId ||
      !selectedSprintId
    ) {
      return;
    }
    try {
      setIsFetchingMoreStories(true);
      const nextPage = storiesPage + 1;
      const res = await triggerGetUserStories({
        projectId,
        payload: {
          sprint_id: selectedSprintId,
          page: nextPage,
          page_size: 3,
          sort_by: 'created_at',
          sort_order: 'DESC',
        },
      }).unwrap();

      const newItems = Array.isArray(res?.data) ? (res.data as UserStory[]) : [];
      if (newItems.length > 0) {
        setStories(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const filtered = newItems.filter(s => !existingIds.has(s.id));
          return [...prev, ...filtered];
        });
        setStoriesPage(nextPage);
      }
      setHasMoreStories(res?.meta?.has_next ?? (newItems.length === 3));
    } catch (err) {
      console.error('Failed to load more user stories:', err);
    } finally {
      setIsFetchingMoreStories(false);
    }
  }, [
    isStoriesLoading,
    isFetchingMoreStories,
    hasMoreStories,
    projectId,
    selectedSprintId,
    storiesPage,
    triggerGetUserStories,
  ]);

  const handleSelectSprint = (sprintId: string) => {
    if (sprintId !== selectedSprintId) {
      setSelectedSprintId(sprintId);
      setSelectedUserStoryId(null);
      setStories([]);
      setStoriesPage(1);
      setHasMoreStories(true);
    }
  };

  const isConfirmDisabled = useMemo(() => {
    if (isSubmitting || !selectedSprintId) return true;
    if (itemType === 'task') {
      if (isStoryless === null) return true;
      if (isStoryless === false && !selectedUserStoryId) return true;
    }
    return false;
  }, [
    isSubmitting,
    selectedSprintId,
    itemType,
    isStoryless,
    selectedUserStoryId,
  ]);

  const handleConfirmMove = async () => {
    if (!selectedSprintId || !itemId || !projectId) {
      showSnackbar({
        message: 'Please select a sprint',
        type: 'error',
      });
      return;
    }

    if (itemType === 'task' && isStoryless === null) {
      showSnackbar({
        message: 'Please select whether this is a storyless task',
        type: 'error',
      });
      return;
    }

    if (itemType === 'task' && isStoryless === false && !selectedUserStoryId) {
      showSnackbar({
        message: 'Please select a user story to assign the task to',
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
        const payload: { sprint_id: string; user_story_id?: string } = {
          sprint_id: selectedSprintId,
        };
        if (isStoryless === false && selectedUserStoryId) {
          payload.user_story_id = selectedUserStoryId;
        }

        await updateTask({
          projectId,
          taskId: itemId,
          payload,
        }).unwrap();
      }

      showSnackbar({
        message:
          itemType === 'story'
            ? 'User story moved to sprint successfully'
            : isStoryless === false
            ? 'Task assigned to user story and moved to sprint successfully'
            : 'Storyless task moved to sprint successfully',
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: moderateScale(16),
            paddingVertical: moderateScale(24),
          }}
        >
          {/* Backdrop dismiss button */}
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            disabled={isSubmitting}
            onPress={onClose}
          />

          {/* Dialog Card Container - Fits comfortably within the screen height */}
          <View
            style={{
              width: '100%',
              maxWidth: moderateScale(390),
              maxHeight: hp(80),
              backgroundColor: colors.card || colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: Radius.lg,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 6,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <View
              style={{
                paddingHorizontal: moderateScale(18),
                paddingTop: moderateScale(16),
                paddingBottom: moderateScale(12),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
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

            {/* Scrollable Dialog Inside Content */}
            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{
                paddingHorizontal: moderateScale(18),
                paddingTop: moderateScale(14),
                paddingBottom: moderateScale(14),
              }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
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

                {/* Sprints Section */}
                <AppText
                  variant='caption'
                  className='mb-2 font-semibold'
                  color={colors.textSecondary}
                >
                  Select Target Sprint
                </AppText>

                {isSprintsLoading ? (
                  <View className='items-center justify-center py-6'>
                    <ActivityIndicator size='small' color={colors.primary} />
                  </View>
                ) : sprints.length === 0 ? (
                  <View className='items-center justify-center rounded-lg py-5 mb-3'>
                    <Ionicons
                      name='folder-open-outline'
                      size={moderateScale(30)}
                      color={colors.textSecondary}
                    />
                    <AppText
                      variant='caption'
                      className='mt-2 text-center text-xs'
                      color={colors.textSecondary}
                    >
                      No sprints found for this project. Please create a sprint
                      first.
                    </AppText>
                  </View>
                ) : (
                  <View
                    className='mb-4'
                    style={{
                      height: moderateScale(175),
                    }}
                  >
                    <FlatList
                      data={sprints}
                      keyExtractor={item => item.id}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      keyboardShouldPersistTaps='handled'
                      onEndReached={handleLoadMoreSprints}
                      onEndReachedThreshold={0.2}
                      onScroll={e => {
                        const {
                          layoutMeasurement,
                          contentOffset,
                          contentSize,
                        } = e.nativeEvent;
                        if (
                          layoutMeasurement.height + contentOffset.y >=
                          contentSize.height - 20
                        ) {
                          handleLoadMoreSprints();
                        }
                      }}
                      scrollEventThrottle={16}
                      renderItem={({ item }) => {
                        const isSelected = selectedSprintId === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.7}
                            onPress={() => handleSelectSprint(item.id)}
                            className='mb-2 flex-row items-center justify-between rounded-lg border p-2.5'
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
                                className='text-xs font-semibold'
                                color={
                                  isSelected ? colors.primary : colors.text
                                }
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
                              size={moderateScale(16)}
                              color={
                                isSelected
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                            />
                          </TouchableOpacity>
                        );
                      }}
                      ListFooterComponent={
                        isFetchingMoreSprints ? (
                          <View className='py-2 items-center justify-center'>
                            <ActivityIndicator
                              size='small'
                              color={colors.primary}
                            />
                          </View>
                        ) : null
                      }
                    />
                  </View>
                )}

                {/* Option for Unassigned Tasks: Storyless Task (Yes/No) */}
                {itemType === 'task' && (
                  <View className='mb-4'>
                    <AppText
                      variant='caption'
                      className='mb-2 font-semibold'
                      color={colors.textSecondary}
                    >
                      Storyless Task?
                    </AppText>
                    <View className='flex-row gap-2.5 mb-1.5'>
                      {/* Yes Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setIsStoryless(true);
                          setSelectedUserStoryId(null);
                        }}
                        className='flex-1 flex-row items-center justify-between rounded-xl border p-2.5'
                        style={{
                          backgroundColor:
                            isStoryless === true
                              ? `${colors.primary}12`
                              : colors.surface,
                          borderColor:
                            isStoryless === true
                              ? colors.primary
                              : colors.border,
                        }}
                      >
                        <View className='flex-row items-center gap-1.5'>
                          <Ionicons
                            name='flash-outline'
                            size={moderateScale(15)}
                            color={
                              isStoryless === true
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <AppText
                            variant='body'
                            className='text-xs font-semibold'
                            color={
                              isStoryless === true
                                ? colors.primary
                                : colors.text
                            }
                          >
                            Yes
                          </AppText>
                        </View>
                        <Ionicons
                          name={
                            isStoryless === true
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={moderateScale(16)}
                          color={
                            isStoryless === true
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </TouchableOpacity>

                      {/* No Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setIsStoryless(false);
                        }}
                        className='flex-1 flex-row items-center justify-between rounded-xl border p-2.5'
                        style={{
                          backgroundColor:
                            isStoryless === false
                              ? `${colors.primary}12`
                              : colors.surface,
                          borderColor:
                            isStoryless === false
                              ? colors.primary
                              : colors.border,
                        }}
                      >
                        <View className='flex-row items-center gap-1.5'>
                          <Ionicons
                            name='layers-outline'
                            size={moderateScale(15)}
                            color={
                              isStoryless === false
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <AppText
                            variant='body'
                            className='text-xs font-semibold'
                            color={
                              isStoryless === false
                                ? colors.primary
                                : colors.text
                            }
                          >
                            No
                          </AppText>
                        </View>
                        <Ionicons
                          name={
                            isStoryless === false
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={moderateScale(16)}
                          color={
                            isStoryless === false
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <AppText
                      variant='caption'
                      className='text-[10px]'
                      color={colors.textSecondary}
                    >
                      {isStoryless === true
                        ? 'Directly add task to sprint without a user story.'
                        : isStoryless === false
                        ? 'Select a user story from this sprint to assign the task to.'
                        : 'Choose "Yes" to add directly to sprint, or "No" to assign to a user story.'}
                    </AppText>
                  </View>
                )}

                {/* User Stories List (Shown only when isStoryless === false) */}
                {itemType === 'task' && isStoryless === false && (
                  <View className='mb-2'>
                    <AppText
                      variant='caption'
                      className='mb-2 font-semibold'
                      color={colors.textSecondary}
                    >
                      Select User Story in Sprint
                    </AppText>

                    {!selectedSprintId ? (
                      <View
                        className='rounded-lg border border-dashed p-3 items-center justify-center'
                        style={{ borderColor: colors.border }}
                      >
                        <AppText
                          variant='caption'
                          className='text-xs'
                          color={colors.textSecondary}
                        >
                          Please select a target sprint above first.
                        </AppText>
                      </View>
                    ) : isStoriesLoading ? (
                      <View className='items-center justify-center py-4'>
                        <ActivityIndicator
                          size='small'
                          color={colors.primary}
                        />
                        <AppText
                          variant='caption'
                          className='mt-1 text-xs'
                          color={colors.textSecondary}
                        >
                          Loading user stories...
                        </AppText>
                      </View>
                    ) : stories.length === 0 ? (
                      <View
                        className='rounded-lg border border-dashed p-3.5 items-center justify-center'
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Ionicons
                          name='document-text-outline'
                          size={moderateScale(24)}
                          color={colors.textSecondary}
                        />
                        <AppText
                          variant='caption'
                          className='mt-1.5 text-center text-xs'
                          color={colors.textSecondary}
                        >
                          No user stories found in this sprint. You can select
                          "Yes" above to move this task as storyless.
                        </AppText>
                      </View>
                    ) : (
                      <View
                        className='mb-2'
                        style={{
                          height: moderateScale(190),
                        }}
                      >
                        <FlatList
                          data={stories}
                          keyExtractor={story => story.id}
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                          keyboardShouldPersistTaps='handled'
                          onEndReached={handleLoadMoreStories}
                          onEndReachedThreshold={0.2}
                          onScroll={e => {
                            const {
                              layoutMeasurement,
                              contentOffset,
                              contentSize,
                            } = e.nativeEvent;
                            if (
                              layoutMeasurement.height + contentOffset.y >=
                              contentSize.height - 20
                            ) {
                              handleLoadMoreStories();
                            }
                          }}
                          scrollEventThrottle={16}
                          renderItem={({ item: story }) => {
                            const isStorySelected =
                              selectedUserStoryId === story.id;
                            const serialNumber =
                              (story as any).formatted_serial_number ||
                              (story.serial_number
                                ? `#${story.serial_number}`
                                : story.key || '');
                            return (
                              <TouchableOpacity
                                key={story.id}
                                activeOpacity={0.7}
                                onPress={() => setSelectedUserStoryId(story.id)}
                                className='mb-2 flex-row items-center justify-between rounded-lg border p-2.5'
                                style={{
                                  backgroundColor: isStorySelected
                                    ? `${colors.primary}10`
                                    : colors.surface,
                                  borderColor: isStorySelected
                                    ? colors.primary
                                    : colors.border,
                                }}
                              >
                                <View className='flex-1 mr-2'>
                                  {serialNumber ? (
                                    <AppText
                                      variant='caption'
                                      className='text-[10px] font-bold'
                                      color={colors.primary}
                                    >
                                      {serialNumber}
                                    </AppText>
                                  ) : null}
                                  <AppText
                                    variant='body'
                                    className='text-xs font-semibold'
                                    color={
                                      isStorySelected
                                        ? colors.primary
                                        : colors.text
                                    }
                                    numberOfLines={1}
                                  >
                                    {story.title}
                                  </AppText>
                                  {story.status && (
                                    <AppText
                                      variant='caption'
                                      className='text-[9px] capitalize mt-0.5'
                                      color={colors.textSecondary}
                                    >
                                      {story.status}
                                    </AppText>
                                  )}
                                </View>
                                <Ionicons
                                  name={
                                    isStorySelected
                                      ? 'radio-button-on'
                                      : 'radio-button-off'
                                  }
                                  size={moderateScale(16)}
                                  color={
                                    isStorySelected
                                      ? colors.primary
                                      : colors.textSecondary
                                  }
                                />
                              </TouchableOpacity>
                            );
                          }}
                          ListFooterComponent={
                            isFetchingMoreStories ? (
                              <View className='py-2 items-center justify-center'>
                                <ActivityIndicator
                                  size='small'
                                  color={colors.primary}
                                />
                              </View>
                            ) : null
                          }
                        />
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Fixed Action Buttons at bottom of Dialog Card */}
              <View
                style={{
                  paddingHorizontal: moderateScale(18),
                  paddingVertical: moderateScale(12),
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(12),
                  backgroundColor: colors.card || colors.surface,
                }}
              >
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
                  disabled={isConfirmDisabled}
                  onPress={handleConfirmMove}
                  className='flex-1 flex-row items-center justify-center rounded-xl py-2.5'
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isConfirmDisabled ? 0.6 : 1,
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
};

export default MoveToSprintModal;
