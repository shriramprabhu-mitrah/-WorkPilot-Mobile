import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import type { ViewToken } from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import { CommonHeader } from '../components/common/CommonHeader';
import AppInput from '../components/common/Input/AppInput';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import BoardFilterModal, { SelectedFilters } from '../components/filterModal';
import Screen from '../components/common/ScreenWapper';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useGetUserStoryByIdQuery,
} from '../store/api/userStoryApi';
import { RootStackParamList } from '../types/navigationTypes';
import { Task } from '../types/project.type';
import { getPriorityThemeColor } from '../utils/enum';
import SwipeableOption from '../components/SwipeableOption';
import DeleteColumnModal from '../components/DeleteColumnModal';
import { usePermissions } from '../hooks/usePermissions';
import CreateTaskBottomSheet from '../components/createTaskBottomSheet';
import { showSnackbar } from '../components/common/Snackbar';
import { useAppDispatch } from '../store';
import {
  favouriteTaskThunk,
  unfavouriteTaskThunk,
} from '../store/project_store/action/projectBoard.thunk';
import {
  useGetCustomStatusQuery,
  useGetProjectMembersQuery,
} from '../store/api/projectApi';

const PAGE_SIZE = 10;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };
const ACCENT_PALETTE = [
  '#7C3AED',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
];

const TaskListScreen = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'TaskList'>>();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreateTaskVisible, setIsCreateTaskVisible] = useState(false);
  const [updatingFavoriteTaskId, setUpdatingFavoriteTaskId] = useState<
    string | null
  >(null);
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    assignee: [],
    status: [],
    priority: [],
    work_type: [],
  });
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const lastRequestedPageRef = useRef(1);
  const prevItemsCountRef = useRef(0);
  const prevPageRef = useRef(1);
  const maxViewedTaskIndexRef = useRef(-1);
  const hasFocusedOnceRef = useRef(false);

  const { permissionsReady, canDeleteTask, canCreateTask } = usePermissions({
    projectId: params.projectId,
  });
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();
  const { data: membersData, isFetching: isMembersFetching } =
    useGetProjectMembersQuery({
      project_id: params.projectId,
    });
  const { data: statusesData } = useGetCustomStatusQuery({
    project_id: params.projectId,
  });
  const taskQueryArgs = {
    projectId: params.projectId,
    user_story_id: params.userStoryId,
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    assignee_id: selectedFilters.assignee.length
      ? selectedFilters.assignee.join(',')
      : undefined,
    status_id: selectedFilters.status.length
      ? selectedFilters.status.join(',')
      : undefined,
    priority: selectedFilters.priority.length
      ? selectedFilters.priority.join(',')
      : undefined,
    type: selectedFilters.work_type.length
      ? selectedFilters.work_type.join(',')
      : undefined,
  };
  const {
    currentData: data,
    isLoading,
    isFetching,
    refetch: refetchTasks,
  } = useGetTasksQuery(taskQueryArgs);
  const pageRef = useRef(page);
  pageRef.current = page;
  const refetchTasksRef = useRef(refetchTasks);
  refetchTasksRef.current = refetchTasks;
  const tasks = data?.data ?? [];
  const meta = data?.meta;
  const { data: userStory } = useGetUserStoryByIdQuery({
    projectId: params.projectId,
    userStoryId: params.userStoryId,
  });

  const refreshTasks = useCallback(() => {
    setHasMoreData(true);
    lastRequestedPageRef.current = 1;
    prevItemsCountRef.current = 0;
    prevPageRef.current = 1;
    maxViewedTaskIndexRef.current = -1;
    if (pageRef.current === 1) {
      refetchTasksRef.current();
    } else {
      setPage(1);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      lastRequestedPageRef.current = 1;
      setHasMoreData(true);
      prevItemsCountRef.current = 0;
      prevPageRef.current = 1;
      maxViewedTaskIndexRef.current = -1;
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!isFetching && data && meta?.page === page) {
      if (typeof meta.has_next === 'boolean') setHasMoreData(meta.has_next);
      if (page > 1 && page !== prevPageRef.current) {
        if (
          tasks.length <= prevItemsCountRef.current &&
          typeof meta.has_next !== 'boolean'
        ) {
          setHasMoreData(false);
        }
        prevPageRef.current = page;
      }
      prevItemsCountRef.current = tasks.length;
    }
  }, [data, isFetching, meta, page, tasks.length]);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnceRef.current) {
        refreshTasks();
      } else {
        hasFocusedOnceRef.current = true;
      }
    }, [refreshTasks]),
  );

  const handleToggleFavorite = useCallback(
    async (task: Task) => {
      if (updatingFavoriteTaskId) return;
      const currentFavorite =
        favoriteOverrides[task.id] ?? Boolean(task.is_favourite);
      const nextFavorite = !currentFavorite;
      setFavoriteOverrides(previous => ({
        ...previous,
        [task.id]: nextFavorite,
      }));
      setUpdatingFavoriteTaskId(task.id);
      try {
        const toggleFavorite = currentFavorite
          ? unfavouriteTaskThunk
          : favouriteTaskThunk;
        await dispatch(
          toggleFavorite({
            projectId: task.project_id,
            taskId: task.id,
          }),
        ).unwrap();
        refreshTasks();
      } catch (error) {
        setFavoriteOverrides(previous => ({
          ...previous,
          [task.id]: currentFavorite,
        }));
        showSnackbar({
          message:
            typeof error === 'string' ? error : 'Failed to update favorite.',
          type: 'error',
        });
      } finally {
        setUpdatingFavoriteTaskId(null);
      }
    },
    [dispatch, favoriteOverrides, refreshTasks, updatingFavoriteTaskId],
  );

  const handleLoadMore = useCallback(() => {
    if (
      isFetching ||
      tasks.length === 0 ||
      !hasMoreData ||
      (meta && meta.page !== page)
    ) {
      return;
    }
    const hasNext = meta?.has_next ?? page < (meta?.total_pages ?? page);
    const nextPage = page + 1;
    if (!hasNext || lastRequestedPageRef.current === nextPage) return;
    lastRequestedPageRef.current = nextPage;
    setPage(nextPage);
  }, [hasMoreData, isFetching, meta, page, tasks.length]);

  const loadedTaskCountRef = useRef(tasks.length);
  loadedTaskCountRef.current = tasks.length;
  const handleLoadMoreRef = useRef(handleLoadMore);
  handleLoadMoreRef.current = handleLoadMore;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visibleIndexes = viewableItems
        .map(token => token.index)
        .filter((index): index is number => index !== null);
      if (visibleIndexes.length === 0) return;
      maxViewedTaskIndexRef.current = Math.max(
        maxViewedTaskIndexRef.current,
        ...visibleIndexes,
      );
      const prefetchIndex = Math.max(
        0,
        loadedTaskCountRef.current - Math.ceil(PAGE_SIZE / 2) - 1,
      );
      if (maxViewedTaskIndexRef.current >= prefetchIndex) {
        handleLoadMoreRef.current();
      }
    },
  ).current;

  useEffect(() => {
    const prefetchIndex = Math.max(
      0,
      tasks.length - Math.ceil(PAGE_SIZE / 2) - 1,
    );
    if (!isFetching && maxViewedTaskIndexRef.current >= prefetchIndex) {
      handleLoadMore();
    }
  }, [handleLoadMore, isFetching, tasks.length]);

  const renderTask = useCallback(
    ({ item, index }: { item: Task; index: number }) => {
      const isFavorite =
        favoriteOverrides[item.id] ?? Boolean(item.is_favourite);
      const priorityColor = getPriorityThemeColor(item.priority, colors);
      const fallbackColor = ACCENT_PALETTE[index % ACCENT_PALETTE.length];
      const isUnassigned = !item.assignee;
      const accent = isUnassigned
        ? fallbackColor
        : item.assignee?.color || fallbackColor;
      const assigneeColor = item.assignee?.color || fallbackColor;
      const assigneeName =
        item.assignee_name || item.assignee?.name || 'Unassigned';
      const assigneeAvatar = item.assignee?.avatar_url;
      return (
        <SwipeableOption
          enabled={permissionsReady && canDeleteTask}
          actionWidth={moderateScale(64)}
          actions={[
            {
              key: 'delete-task',
              icon: 'trash-outline',
              accessibilityLabel: `Delete task ${item.title || ''}`,
              onPress: () => setTaskToDelete(item),
              width: moderateScale(64),
              iconSize: moderateScale(22),
            },
          ]}
          containerStyle={{
            marginBottom: moderateScale(12),
            borderRadius: 16,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('issue', {
                projectId: params.projectId,
                userStoryId: params.userStoryId,
                taskId: item.id,
                task: item,
                taskName: item.title,
                fromUserStory: true,
              })
            }
            className='rounded-2xl border p-4'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: moderateScale(4),
                backgroundColor: accent,
              }}
            />
            <View className='flex-row items-center'>
              <View
                className='mr-3 items-center justify-center rounded-xl'
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  backgroundColor: `${colors.primary}18`,
                }}
              >
                <WorkItemIcon type='task' size={moderateScale(20)} />
              </View>
              <View className='flex-1'>
                <AppText
                  variant='body'
                  color={colors.text}
                  className='font-bold capitalize'
                  numberOfLines={1}
                >
                  {item.title || 'Untitled Task'}
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={{ marginTop: moderateScale(3) }}
                >
                  {item.key || item.formatted_serial_number || 'N/A'}
                </AppText>
              </View>
              <View className='flex-row items-center' style={{ gap: 2 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={Boolean(updatingFavoriteTaskId)}
                  accessibilityRole='button'
                  accessibilityLabel={`${isFavorite ? 'Remove' : 'Add'} ${item.title || 'task'} ${isFavorite ? 'from' : 'to'} favorites`}
                  onPress={event => {
                    event.stopPropagation();
                    handleToggleFavorite(item);
                  }}
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    opacity: updatingFavoriteTaskId === item.id ? 0.45 : 1,
                  }}
                >
                  <Ionicons
                    name={isFavorite ? 'star' : 'star-outline'}
                    size={moderateScale(17)}
                    color={
                      isFavorite
                        ? colors.warning || '#F59E0B'
                        : colors.textSecondary
                    }
                  />
                </TouchableOpacity>
                <Ionicons
                  name='chevron-forward'
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                />
              </View>
            </View>
            <View
              className='mt-3 flex-row items-center justify-between border-t pt-3'
              style={{ borderColor: colors.border }}
            >
              <View
                className='flex-row items-center'
                style={{ gap: moderateScale(8) }}
              >
                <View
                  className='rounded-full px-2 py-1'
                  style={{
                    backgroundColor: `${priorityColor}18`,
                  }}
                >
                  <AppText
                    variant='caption'
                    color={priorityColor}
                    className='font-semibold capitalize'
                  >
                    {item.priority || 'No priority'}
                  </AppText>
                </View>
                <View
                  className='rounded-full px-2 py-1'
                  style={{
                    backgroundColor: `${item.status_color || colors.border}20`,
                  }}
                >
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {item.status}
                  </AppText>
                </View>
              </View>
              <View
                className='flex-row items-center'
                style={{ gap: moderateScale(6) }}
              >
                {assigneeName === 'Unassigned' ? (
                  <View
                    className='items-center justify-center rounded-full'
                    style={{
                      width: moderateScale(26),
                      height: moderateScale(26),
                      backgroundColor: `${assigneeColor}20`,
                    }}
                  >
                    <Ionicons
                      name='person'
                      size={moderateScale(14)}
                      color={assigneeColor}
                    />
                  </View>
                ) : (
                  <Avatar
                    dimension={moderateScale(26)}
                    initials={assigneeName.charAt(0).toUpperCase()}
                    color={assigneeColor}
                    imageUrl={assigneeAvatar}
                  />
                )}
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={{ maxWidth: moderateScale(100) }}
                >
                  {assigneeName}
                </AppText>
              </View>
            </View>
          </TouchableOpacity>
        </SwipeableOption>
      );
    },
    [
      canDeleteTask,
      colors,
      favoriteOverrides,
      handleToggleFavorite,
      moderateScale,
      navigation,
      params.projectId,
      params.userStoryId,
      permissionsReady,
      updatingFavoriteTaskId,
    ],
  );

  const appliedFiltersCount = Object.values(selectedFilters).reduce(
    (total, values) => total + values.length,
    0,
  );

  const handleConfirmDelete = async () => {
    if (!taskToDelete || !permissionsReady || !canDeleteTask) {
      return;
    }
    try {
      await deleteTask({
        projectId: params.projectId,
        taskIds: [taskToDelete.id],
        userStoryId: params.userStoryId,
      }).unwrap();
      setTaskToDelete(null);
      showSnackbar({
        message: 'Task deleted successfully.',
        type: 'success',
      });
      refreshTasks();
    } catch (error: any) {
      showSnackbar({
        message:
          error?.data?.message || error?.message || 'Failed to delete task.',
        type: 'error',
      });
    }
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='taskList'
        title={userStory?.title || 'User Story'}
        subtitle={`Task List (${meta?.total_items ?? tasks.length})`}
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
        canAddTask={permissionsReady && canCreateTask}
        onAddTaskPress={() => setIsCreateTaskVisible(true)}
        onFilterPress={() => setIsFilterVisible(true)}
        appliedFiltersCount={appliedFiltersCount}
      >
        <AppInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='Search tasks...'
          leftIcon={
            <Ionicons
              name='search-outline'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          }
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons
                  name='close-circle'
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </CommonHeader>
      {(isLoading || isFetching) && tasks.length === 0 ? (
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap }}
            renderItem={() => <ProjectCardSkeleton />}
          />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(20),
            flexGrow: tasks.length === 0 ? 1 : undefined,
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center py-12'>
              <Ionicons
                name='checkbox'
                size={moderateScale(46)}
                color={colors.textSecondary}
              />
              <AppText
                variant='body'
                color={colors.textSecondary}
                style={{ marginTop: moderateScale(12) }}
              >
                No tasks found.
              </AppText>
            </View>
          }
          ListFooterComponent={
            isFetching && tasks.length > 0 ? (
              <View className='py-2'>
                <ProjectCardSkeleton />
              </View>
            ) : null
          }
        />
      )}
      <BoardFilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        members={membersData?.data ?? []}
        statuses={statusesData?.data ?? []}
        selectedFilters={selectedFilters}
        hasMoreAssignees={Boolean(membersData?.meta?.has_next)}
        isLoadingAssignees={isMembersFetching}
        onApplyFilters={filters => {
          setSelectedFilters(filters);
          setPage(1);
          lastRequestedPageRef.current = 1;
          setHasMoreData(true);
          prevItemsCountRef.current = 0;
          prevPageRef.current = 1;
          maxViewedTaskIndexRef.current = -1;
        }}
      />
      <CreateTaskBottomSheet
        visible={isCreateTaskVisible}
        onClose={() => setIsCreateTaskVisible(false)}
        projectId={params.projectId}
        userStoryId={params.userStoryId}
        onSuccess={refreshTasks}
      />
      <DeleteColumnModal
        visible={Boolean(taskToDelete)}
        title='Delete Task'
        columnTitle={taskToDelete?.title || 'Untitled Task'}
        onClose={() => setTaskToDelete(null)}
        onDelete={handleConfirmDelete}
        loading={isDeletingTask}
      />
    </Screen>
  );
};

export default TaskListScreen;
