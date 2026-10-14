import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText, AppInput } from '../components';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { useAppSelector } from '../store';
import { useGetUserStoriesQuery } from '../store/api/projectApi';
import {
  useGetTasksQuery,
  useCreateUserStoryMutation,
  useDeleteUserStoryMutation,
  useUploadUserStoryAttachmentMutation,
} from '../store/api/userStoryApi';
import { skipToken } from '@reduxjs/toolkit/query';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { UserStory, CreateUserStoryPayload, Task } from '../types/project.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { RootStackParamList } from '../types/navigationTypes';
import CreateProjectModal, {
  StoryAttachmentFile,
} from '../components/createProjectModel';
import DeleteColumnModal from '../components/DeleteColumnModal';
import MoveToSprintModal from '../components/MoveToSprintModal';
import CreateTaskBottomSheet from '../components/createTaskBottomSheet';
import { TASK_PRIORITY_OPTIONS } from '../utils/enum';
import { showSnackbar } from '../components/common/Snackbar';

const SwipeDeleteAction = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        width: moderateScale(60),
        marginLeft: moderateScale(8),
        borderRadius: Radius.md,
        backgroundColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name='trash-outline' size={moderateScale(25)} color='#FFFFFF' />
    </TouchableOpacity>
  );
};

export const Backlogs = () => {
  const { colors } = useTheme();
  const { moderateScale, layout, hp } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion open/close states (collapsed by default)
  const [isStoriesAccordionOpen, setIsStoriesAccordionOpen] = useState(false);
  const [isTasksAccordionOpen, setIsTasksAccordionOpen] = useState(false);

  // Pagination states for Unassigned Stories
  const [storyPage, setStoryPage] = useState(1);
  const [storyRefetchKey, setStoryRefetchKey] = useState(0);
  const [allStories, setAllStories] = useState<UserStory[]>([]);
  const [hasNoMoreStories, setHasNoMoreStories] = useState(false);
  const [isFetchingNextStoryPage, setIsFetchingNextStoryPage] = useState(false);
  const lastRequestedStoryPageRef = useRef(1);

  // Pagination states for Unassigned Tasks
  const [taskPage, setTaskPage] = useState(1);
  const [taskRefetchKey, setTaskRefetchKey] = useState(0);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [hasNoMoreTasks, setHasNoMoreTasks] = useState(false);
  const [isFetchingNextTaskPage, setIsFetchingNextTaskPage] = useState(false);
  const lastRequestedTaskPageRef = useRef(1);

  // Refreshing state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isCreateStoryVisible, setIsCreateStoryVisible] = useState(false);
  const [isCreateTaskVisible, setIsCreateTaskVisible] = useState(false);
  const [deleteStoryItem, setDeleteStoryItem] = useState<UserStory | null>(
    null,
  );

  // Move to Sprint Modal state
  const [moveModalItem, setMoveModalItem] = useState<{
    id: string;
    title: string;
    formattedSerial?: string;
    type: 'story' | 'task';
  } | null>(null);

  // Project ID from Redux
  const { project } = useAppSelector(state => state.projects);
  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  // Mutations
  const [createUserStory, { isLoading: isCreatingStory }] =
    useCreateUserStoryMutation();
  const [deleteUserStory, { isLoading: isDeleting }] =
    useDeleteUserStoryMutation();
  const [uploadUserStoryAttachment] = useUploadUserStoryAttachmentMutation();

  // 1. RTK Query: Unassigned User Stories
  const {
    data: unassignedStoriesData,
    isLoading: isStoriesLoading,
    isFetching: isStoriesFetching,
    refetch: refetchStories,
  } = useGetUserStoriesQuery(
    projectId
      ? {
          projectId,
          payload: {
            page: storyPage,
            page_size: 10,
            sort_by: 'created_at',
            sort_order: 'DESC',
            is_unassigned_story: true,
          },
          _refetchKey: storyRefetchKey,
        }
      : skipToken,
    { refetchOnFocus: true },
  );

  // 2. RTK Query: Unassigned Tasks
  const {
    data: unassignedTasksData,
    isLoading: isTasksLoading,
    isFetching: isTasksFetching,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    projectId
      ? {
          projectId,
          page: taskPage,
          page_size: 10,
          sort_by: 'created_at',
          sort_order: 'DESC',
          is_deleted: false,
          unassigned_task: true,
          storyless_task: false,
          _refetchKey: taskRefetchKey,
        }
      : skipToken,
    { refetchOnFocus: true },
  );

  // Sync Unassigned User Stories
  useEffect(() => {
    if (!unassignedStoriesData?.data) return;
    const incoming = (unassignedStoriesData.data as UserStory[]) || [];
    if (incoming.length === 0 && storyPage > 1) {
      setHasNoMoreStories(true);
      setIsFetchingNextStoryPage(false);
      return;
    }
    if (unassignedStoriesData.meta?.has_next === false) {
      setHasNoMoreStories(true);
    } else if (
      unassignedStoriesData.meta?.total_pages &&
      storyPage >= unassignedStoriesData.meta.total_pages
    ) {
      setHasNoMoreStories(true);
    } else {
      setHasNoMoreStories(false);
    }

    if (storyPage === 1) {
      setAllStories(incoming);
    } else {
      setAllStories(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = incoming.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
    setIsFetchingNextStoryPage(false);
  }, [unassignedStoriesData, storyPage]);

  // Sync Unassigned Tasks
  useEffect(() => {
    if (!unassignedTasksData?.data) return;
    const incoming = (unassignedTasksData.data as Task[]) || [];
    if (incoming.length === 0 && taskPage > 1) {
      setHasNoMoreTasks(true);
      setIsFetchingNextTaskPage(false);
      return;
    }
    if (unassignedTasksData.meta?.has_next === false) {
      setHasNoMoreTasks(true);
    } else if (
      unassignedTasksData.meta?.total_pages &&
      taskPage >= unassignedTasksData.meta.total_pages
    ) {
      setHasNoMoreTasks(true);
    } else {
      setHasNoMoreTasks(false);
    }

    if (taskPage === 1) {
      setAllTasks(incoming);
    } else {
      setAllTasks(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = incoming.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
    setIsFetchingNextTaskPage(false);
  }, [unassignedTasksData, taskPage]);

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        refetchStories();
        refetchTasks();
      }
    }, [projectId, refetchStories, refetchTasks]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setStoryPage(1);
    setTaskPage(1);
    lastRequestedStoryPageRef.current = 1;
    lastRequestedTaskPageRef.current = 1;
    setStoryRefetchKey(prev => prev + 1);
    setTaskRefetchKey(prev => prev + 1);
    await Promise.all([refetchStories(), refetchTasks()]);
    setIsRefreshing(false);
  }, [refetchStories, refetchTasks]);

  const handleLoadMoreStories = useCallback(() => {
    if (
      !isStoriesLoading &&
      !isFetchingNextStoryPage &&
      !hasNoMoreStories &&
      projectId
    ) {
      const nextPage = storyPage + 1;
      if (lastRequestedStoryPageRef.current === nextPage) return;
      lastRequestedStoryPageRef.current = nextPage;
      setIsFetchingNextStoryPage(true);
      setStoryPage(nextPage);
    }
  }, [
    isStoriesLoading,
    isFetchingNextStoryPage,
    hasNoMoreStories,
    projectId,
    storyPage,
  ]);

  const handleLoadMoreTasks = useCallback(() => {
    if (
      !isTasksLoading &&
      !isFetchingNextTaskPage &&
      !hasNoMoreTasks &&
      projectId
    ) {
      const nextPage = taskPage + 1;
      if (lastRequestedTaskPageRef.current === nextPage) return;
      lastRequestedTaskPageRef.current = nextPage;
      setIsFetchingNextTaskPage(true);
      setTaskPage(nextPage);
    }
  }, [
    isTasksLoading,
    isFetchingNextTaskPage,
    hasNoMoreTasks,
    projectId,
    taskPage,
  ]);

  // Create Story
  const handleCreateStory = async (
    payload: CreateUserStoryPayload,
    file?: StoryAttachmentFile,
  ) => {
    if (!projectId) {
      showSnackbar({
        message: 'Project not selected',
        type: 'error',
      });
      return;
    }
    try {
      const response = await createUserStory({
        projectId: String(projectId),
        payload: {
          ...payload,
          sprint_id: null,
        },
      }).unwrap();

      if (response.data?.id && file) {
        uploadUserStoryAttachment({
          projectId: String(projectId),
          userStoryId: String(response.data.id),
          file,
        });
      }

      refetchStories();
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.message || 'Failed to create user story',
        type: 'error',
      });
      throw error;
    }
  };

  // Delete Story
  const handleConfirmDelete = async () => {
    if (!deleteStoryItem || !projectId) return;
    try {
      await deleteUserStory({
        projectId: String(projectId),
        userStoryId: deleteStoryItem.id,
      }).unwrap();

      setAllStories(prev => prev.filter(s => s.id !== deleteStoryItem.id));
      setDeleteStoryItem(null);
      showSnackbar({
        message: 'User story deleted successfully',
        type: 'success',
      });
      refetchStories();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.data?.message || err?.message || 'Failed to delete user story',
        type: 'error',
      });
    }
  };

  // Priority badge styling
  const getPriorityConfig = useCallback(
    (priority?: string) => {
      const p = (priority || '').toLowerCase();
      switch (p) {
        case 'highest':
        case 'high':
          return { label: 'High', color: colors.error, bgColor: '#FEE2E2' };
        case 'medium':
          return { label: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7' };
        case 'low':
        case 'lowest':
          return { label: 'Low', color: '#10B981', bgColor: '#D1FAE5' };
        default:
          return {
            label: priority || 'Normal',
            color: colors.textSecondary,
            bgColor: colors.surface,
          };
      }
    },
    [colors],
  );

  // Filtered stories
  const filteredStories = useMemo(() => {
    const list =
      allStories.length > 0
        ? allStories
        : (unassignedStoriesData?.data as UserStory[]) || [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(story => {
      const title = story?.title || '';
      const serial = story?.formatted_serial_number || '';
      const status = story?.status || '';
      return (
        title.toLowerCase().includes(query) ||
        serial.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [allStories, unassignedStoriesData?.data, searchQuery]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const list =
      allTasks.length > 0
        ? allTasks
        : (unassignedTasksData?.data as Task[]) || [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(task => {
      const title = task?.title || '';
      const serial = task?.formatted_serial_number || '';
      const status = task?.status || '';
      return (
        title.toLowerCase().includes(query) ||
        serial.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [allTasks, unassignedTasksData?.data, searchQuery]);

  const totalStoriesCount =
    unassignedStoriesData?.meta?.total_items ?? filteredStories.length;
  const totalTasksCount =
    unassignedTasksData?.meta?.total_items ?? filteredTasks.length;

  return (
    <View className='flex-1' style={{ backgroundColor: colors.surface }}>
      {/* Header Search & Actions */}
      <View className='px-4 pt-3' style={{ backgroundColor: colors.surface }}>
        <View className='mb-3'>
          <AppInput
            placeholder='Search unassigned stories, tasks...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <Ionicons
                name='search-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
          />
        </View>

        <View
          className='mb-3 flex-row items-center justify-between'
          style={{ gap: layout.elementGap }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <AppText
              variant='caption'
              className='font-bold tracking-wider'
              color={colors.textSecondary}
            >
              Backlog Overview
            </AppText>
          </View>
          <View className='flex-row items-center gap-2'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCreateStoryVisible(true)}
              disabled={!projectId}
              className='flex-row items-center rounded-lg px-2.5 py-1.5'
              style={{
                backgroundColor: colors.primary,
                opacity: projectId ? 1 : 0.5,
                gap: moderateScale(4),
              }}
            >
              <Ionicons
                name='add'
                size={moderateScale(16)}
                color={colors.white}
              />
              <AppText
                variant='caption'
                className='text-xs font-semibold'
                color={colors.white}
              >
                Add Story
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCreateTaskVisible(true)}
              disabled={!projectId}
              className='flex-row items-center rounded-lg px-2.5 py-1.5'
              style={{
                backgroundColor: colors.primary,
                opacity: projectId ? 1 : 0.5,
                gap: moderateScale(4),
              }}
            >
              <Ionicons
                name='add'
                size={moderateScale(16)}
                color={colors.white}
              />
              <AppText
                variant='caption'
                className='text-xs font-semibold'
                color={colors.white}
              >
                Add Task
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Scroll Content with Accordions */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: moderateScale(16),
          paddingBottom: hp(15),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ======================================================== */}
        {/* ACCORDION 1: UNASSIGNED USER STORIES                    */}
        {/* ======================================================== */}
        <View className='mb-4'>
          {/* Accordion Header */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsStoriesAccordionOpen(prev => !prev)}
            className='flex-row items-center justify-between rounded-xl border p-3.5'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className='flex-row items-center gap-2.5'>
              <Ionicons
                name={
                  isStoriesAccordionOpen ? 'chevron-down' : 'chevron-forward'
                }
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
              <View
                className='items-center justify-center rounded-lg p-1.5'
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <WorkItemIcon type='user_story' size={moderateScale(16)} />
              </View>
              <AppText
                variant='body'
                className='text-sm font-bold'
                color={colors.text}
              >
                Unassigned User Stories
              </AppText>
            </View>

            <View
              className='items-center justify-center rounded-full px-2.5 py-0.5'
              style={{
                backgroundColor: colors.primary,
                minWidth: moderateScale(22),
              }}
            >
              <AppText
                variant='caption'
                className='text-xs font-bold'
                color={colors.white}
              >
                {totalStoriesCount}
              </AppText>
            </View>
          </TouchableOpacity>

          {/* Accordion Content */}
          {isStoriesAccordionOpen && (
            <View className='pt-2'>
              {isStoriesLoading && storyPage === 1 ? (
                <View className='py-2'>
                  <ListSkeleton
                    count={3}
                    containerStyle={{ gap: layout.elementGap - 2 }}
                    renderItem={index => <ProjectCardSkeleton key={index} />}
                  />
                </View>
              ) : filteredStories.length === 0 ? (
                <View
                  className='my-1 items-center justify-center rounded-xl border border-dashed px-4 py-8'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Ionicons
                    name='document-text-outline'
                    size={moderateScale(30)}
                    color={colors.textSecondary}
                  />
                  <AppText
                    variant='caption'
                    className='mt-2 text-center text-xs'
                    color={colors.textSecondary}
                  >
                    {searchQuery.trim()
                      ? `No user stories match "${searchQuery}".`
                      : 'No unassigned user stories in this project.'}
                  </AppText>
                </View>
              ) : (
                <View style={{ gap: moderateScale(10) }}>
                  {filteredStories.map(story => {
                    const priorityConfig = getPriorityConfig(story.priority);
                    return (
                      <Swipeable
                        key={story.id}
                        renderRightActions={() => (
                          <SwipeDeleteAction
                            onPress={() => setDeleteStoryItem(story)}
                          />
                        )}
                        overshootRight={false}
                      >
                        <View
                          className='overflow-hidden rounded-xl border p-3.5'
                          style={{
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          }}
                        >
                          {/* Story Info Row */}
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                              navigation.navigate('issue', {
                                projectId,
                                userStoryId: story.id,
                                story,
                              })
                            }
                            className='flex-row items-center'
                            style={{ gap: layout.elementGap }}
                          >
                            <View className='flex-1' style={{ gap: 2 }}>
                              <AppText
                                variant='caption'
                                color={colors.textSecondary}
                                numberOfLines={1}
                              >
                                {story.formatted_serial_number ||
                                  `#${story.serial_number}`}
                              </AppText>
                              <AppText
                                variant='body'
                                color={colors.text}
                                className='text-xs font-bold'
                                numberOfLines={2}
                              >
                                {story.title
                                  ? story.title.charAt(0).toUpperCase() +
                                    story.title.slice(1)
                                  : ''}
                              </AppText>
                            </View>

                            {/* Status & Priority */}
                            <View
                              className='items-end'
                              style={{ gap: layout.elementGap / 2 }}
                            >
                              <View
                                className='rounded-md px-2 py-0.5'
                                style={{
                                  backgroundColor: priorityConfig.bgColor,
                                }}
                              >
                                <AppText
                                  variant='caption'
                                  className='text-[10px] font-semibold capitalize'
                                  style={{ color: priorityConfig.color }}
                                >
                                  {priorityConfig.label}
                                </AppText>
                              </View>
                              <View
                                className='items-center justify-center px-2 py-0.5'
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: Radius.circle,
                                }}
                              >
                                <AppText
                                  variant='caption'
                                  style={{ color: colors.primary }}
                                  className='text-[10px] font-semibold'
                                >
                                  {story.status || 'To Do'}
                                </AppText>
                              </View>
                            </View>
                          </TouchableOpacity>

                          {/* Action Button Row */}
                          <View
                            className='mt-3 flex-row items-center justify-end border-t pt-2.5'
                            style={{ borderColor: colors.border }}
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                setMoveModalItem({
                                  id: story.id,
                                  title: story.title,
                                  formattedSerial:
                                    story.formatted_serial_number ||
                                    `#${story.serial_number}`,
                                  type: 'story',
                                })
                              }
                              className='flex-row items-center rounded-lg border px-3 py-1.5'
                              style={{
                                backgroundColor: `${colors.primary}12`,
                                borderColor: `${colors.primary}40`,
                                gap: moderateScale(5),
                              }}
                            >
                              <Ionicons
                                name='arrow-redo-outline'
                                size={moderateScale(13)}
                                color={colors.primary}
                              />
                              <AppText
                                variant='caption'
                                className='text-[11px] font-bold'
                                color={colors.primary}
                              >
                                Move to Sprint
                              </AppText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Swipeable>
                    );
                  })}

                  {/* Load More Stories Button */}
                  {!hasNoMoreStories && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={isFetchingNextStoryPage}
                      onPress={handleLoadMoreStories}
                      className='mt-1 items-center justify-center rounded-xl border py-2.5'
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      }}
                    >
                      {isFetchingNextStoryPage ? (
                        <ActivityIndicator
                          size='small'
                          color={colors.primary}
                        />
                      ) : (
                        <AppText
                          variant='caption'
                          className='text-xs font-bold'
                          color={colors.primary}
                        >
                          Load More Stories
                        </AppText>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ======================================================== */}
        {/* ACCORDION 2: UNASSIGNED TASKS                           */}
        {/* ======================================================== */}
        <View className='mb-4'>
          {/* Accordion Header */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsTasksAccordionOpen(prev => !prev)}
            className='flex-row items-center justify-between rounded-xl border p-3.5'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className='flex-row items-center gap-2.5'>
              <Ionicons
                name={isTasksAccordionOpen ? 'chevron-down' : 'chevron-forward'}
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
              <View
                className='items-center justify-center rounded-lg p-1.5'
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <WorkItemIcon type='task' size={moderateScale(16)} />
              </View>
              <AppText
                variant='body'
                className='text-sm font-bold'
                color={colors.text}
              >
                Unassigned Tasks
              </AppText>
            </View>

            <View className='flex-row items-center gap-2'>
              {/* <TouchableOpacity
                activeOpacity={0.8}
                onPress={e => {
                  e.stopPropagation();
                  setIsCreateTaskVisible(true);
                }}
                disabled={!projectId}
                className='flex-row items-center rounded-full border px-2 py-0.5'
                style={{
                  backgroundColor: `${colors.primary}12`,
                  borderColor: `${colors.primary}30`,
                  gap: moderateScale(2),
                }}
              >
                <Ionicons
                  name='add'
                  size={moderateScale(14)}
                  color={colors.primary}
                />
                <AppText
                  variant='caption'
                  className='text-[10px] font-bold'
                  color={colors.primary}
                >
                  New Task
                </AppText>
              </TouchableOpacity> */}

              <View
                className='items-center justify-center rounded-full px-2.5 py-0.5'
                style={{
                  backgroundColor: colors.primary,
                  minWidth: moderateScale(22),
                }}
              >
                <AppText
                  variant='caption'
                  className='text-xs font-bold'
                  color={colors.white}
                >
                  {totalTasksCount}
                </AppText>
              </View>
            </View>
          </TouchableOpacity>

          {/* Accordion Content */}
          {isTasksAccordionOpen && (
            <View className='pt-2'>
              {isTasksLoading && taskPage === 1 ? (
                <View className='py-2'>
                  <ListSkeleton
                    count={3}
                    containerStyle={{ gap: layout.elementGap - 2 }}
                    renderItem={index => <ProjectCardSkeleton key={index} />}
                  />
                </View>
              ) : filteredTasks.length === 0 ? (
                <View
                  className='my-1 items-center justify-center rounded-xl border border-dashed px-4 py-8'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Ionicons
                    name='checkbox-outline'
                    size={moderateScale(30)}
                    color={colors.textSecondary}
                  />
                  <AppText
                    variant='caption'
                    className='mt-2 text-center text-xs'
                    color={colors.textSecondary}
                  >
                    {searchQuery.trim()
                      ? `No tasks match "${searchQuery}".`
                      : 'No unassigned tasks in this project.'}
                  </AppText>
                </View>
              ) : (
                <View style={{ gap: moderateScale(10) }}>
                  {filteredTasks.map(task => {
                    const priorityConfig = getPriorityConfig(task.priority);
                    return (
                      <View
                        key={task.id}
                        className='overflow-hidden rounded-xl border p-3.5'
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        }}
                      >
                        {/* Task Info Row */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation.navigate('issue', {
                              projectId,
                              taskId: task.id,
                              task,
                            })
                          }
                          className='flex-row items-center'
                          style={{ gap: layout.elementGap }}
                        >
                          <View className='flex-1' style={{ gap: 2 }}>
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                              numberOfLines={1}
                            >
                              {task.formatted_serial_number ||
                                `#${task.serial_number}`}
                            </AppText>
                            <AppText
                              variant='body'
                              color={colors.text}
                              className='text-xs font-bold'
                              numberOfLines={2}
                            >
                              {task.title
                                ? task.title.charAt(0).toUpperCase() +
                                  task.title.slice(1)
                                : ''}
                            </AppText>
                          </View>

                          {/* Status & Priority */}
                          <View
                            className='items-end'
                            style={{ gap: layout.elementGap / 2 }}
                          >
                            <View
                              className='rounded-md px-2 py-0.5'
                              style={{
                                backgroundColor: priorityConfig.bgColor,
                              }}
                            >
                              <AppText
                                variant='caption'
                                className='text-[10px] font-semibold capitalize'
                                style={{ color: priorityConfig.color }}
                              >
                                {priorityConfig.label}
                              </AppText>
                            </View>
                            <View
                              className='items-center justify-center px-2 py-0.5'
                              style={{
                                backgroundColor: colors.surface,
                                borderRadius: Radius.circle,
                              }}
                            >
                              <AppText
                                variant='caption'
                                style={{ color: colors.primary }}
                                className='text-[10px] font-semibold'
                              >
                                {task.status || 'To Do'}
                              </AppText>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* Action Button Row */}
                        <View
                          className='mt-3 flex-row items-center justify-end border-t pt-2.5'
                          style={{ borderColor: colors.border }}
                        >
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() =>
                              setMoveModalItem({
                                id: task.id,
                                title: task.title,
                                formattedSerial:
                                  task.formatted_serial_number ||
                                  `#${task.serial_number}`,
                                type: 'task',
                              })
                            }
                            className='flex-row items-center rounded-lg border px-3 py-1.5'
                            style={{
                              backgroundColor: `${colors.primary}12`,
                              borderColor: `${colors.primary}40`,
                              gap: moderateScale(5),
                            }}
                          >
                            <Ionicons
                              name='arrow-redo-outline'
                              size={moderateScale(13)}
                              color={colors.primary}
                            />
                            <AppText
                              variant='caption'
                              className='text-[11px] font-bold'
                              color={colors.primary}
                            >
                              Move to Sprint
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Load More Tasks Button */}
                  {!hasNoMoreTasks && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={isFetchingNextTaskPage}
                      onPress={handleLoadMoreTasks}
                      className='mt-1 items-center justify-center rounded-xl border py-2.5'
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      }}
                    >
                      {isFetchingNextTaskPage ? (
                        <ActivityIndicator
                          size='small'
                          color={colors.primary}
                        />
                      ) : (
                        <AppText
                          variant='caption'
                          className='text-xs font-bold'
                          color={colors.primary}
                        >
                          Load More Tasks
                        </AppText>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create User Story Modal */}
      <CreateProjectModal
        visible={isCreateStoryVisible}
        onClose={() => setIsCreateStoryVisible(false)}
        mode='story'
        title='Create Story'
        projectId={projectId ? String(projectId) : undefined}
        priorities={[...TASK_PRIORITY_OPTIONS]}
        onCreateStory={handleCreateStory}
        isCreatingStory={isCreatingStory}
        onSuccess={() => {
          setIsCreateStoryVisible(false);
          refetchStories();
        }}
      />

      {/* Delete User Story Modal */}
      <DeleteColumnModal
        visible={Boolean(deleteStoryItem)}
        title='Delete User Story'
        columnTitle={deleteStoryItem?.title ?? 'this user story'}
        colors={colors}
        loading={isDeleting}
        onClose={() => setDeleteStoryItem(null)}
        onDelete={handleConfirmDelete}
      />

      {/* Move to Sprint Modal */}
      <MoveToSprintModal
        visible={Boolean(moveModalItem)}
        itemId={moveModalItem?.id}
        itemTitle={moveModalItem?.title}
        itemFormattedSerial={moveModalItem?.formattedSerial}
        itemType={moveModalItem?.type || 'story'}
        projectId={projectId ? String(projectId) : undefined}
        onClose={() => setMoveModalItem(null)}
        onSuccess={() => {
          refetchStories();
          refetchTasks();
        }}
      />

      {/* Create Unassigned Task Modal */}
      <CreateTaskBottomSheet
        visible={isCreateTaskVisible}
        onClose={() => setIsCreateTaskVisible(false)}
        projectId={projectId ? String(projectId) : undefined}
        onSuccess={() => {
          setIsCreateTaskVisible(false);
          refetchTasks();
        }}
      />
    </View>
  );
};

export default Backlogs;
