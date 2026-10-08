import React, {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  startTransition,
} from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  CreateUserStoryPayload,
  BoardStory,
  BoardTask,
  BoardStatusColumn,
  UserStory,
} from '../types/project.type';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  useGetProjectMembersQuery,
  useGetBoardStoriesQuery,
  useLazyGetBoardStatusTasksQuery,
} from '../store/api/projectApi';
import {
  favouriteTaskThunk,
  unfavouriteTaskThunk,
  favouriteUserStoryThunk,
  unfavouriteUserStoryThunk,
} from '../store/project_store/action/projectBoard.thunk';
import { showSnackbar } from '../components/common/Snackbar';
import Animated, {
  useSharedValue,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SharedValue } from 'react-native-reanimated';
import { DropZone, ColumnTaskState } from '../types/project.type';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  useUpdateTaskMutation,
  useCreateUserStoryMutation,
  useUploadUserStoryAttachmentMutation,
} from '../store/api/userStoryApi';
import { TASK_PRIORITY_OPTIONS } from '../utils/enum';
import CreateProjectModal, {
  StoryAttachmentFile,
} from '../components/createProjectModel';
import BoardFilterModal, { SelectedFilters } from '../components/filterModal';
import { Radius } from '../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  BoardSkeleton,
  BoardSkeletonRow,
} from '../components/skeleton/boardSkeleton';
import { UserStoryBoardRow } from '../components/userStoryBoardRow';
import TaskCard from '../components/TaskCard';

const DragPreviewOverlay = ({
  task,
  projectId,
  colors,
  dragX,
  dragY,
  originX,
  originY,
  width,
  offsetX,
  offsetY,
}: {
  task: BoardTask;
  projectId?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  originX: number;
  originY: number;
  width: number;
  offsetX: number;
  offsetY: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    left: Math.max(0, dragX.value - originX - offsetX),
    top: Math.max(0, dragY.value - originY - offsetY),
  }));

  return (
    <Animated.View
      pointerEvents='none'
      style={[
        { position: 'absolute', width, zIndex: 10000, elevation: 30 },
        animatedStyle,
      ]}
    >
      <TaskCard
        item={{
          id: task.id,
          title: task.title,
          priority: task.priority,
          story_points: `${task.story_points ?? 0}p`,
          key: task.key || (task as any).task_key,
          due_date: task.due_date,
          avatarUrl: task.assignee?.avatar_url,
          avatar:
            task.assignee?.name?.charAt(0)?.toUpperCase() ||
            task.assignee_name?.charAt(0)?.toUpperCase() ||
            '',
          avatarColor: task.assignee?.color || colors.primary,
          is_favourite: task.is_favourite,
        }}
        projectId={projectId}
      />
    </Animated.View>
  );
};

const ProjectDeatailsScreen = () => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollOffset = useSharedValue(0);
  const verticalScrollOffset = useSharedValue(0);
  const [dragPreviewTask, setDragPreviewTask] = useState<BoardTask | null>(
    null,
  );
  const dragPreviewX = useSharedValue(0);
  const dragPreviewY = useSharedValue(0);
  const [rootOrigin, setRootOrigin] = useState({ x: 0, y: 0 });
  const rootViewRef = useRef<View>(null);

  // Redux Selectors
  const {
    project,
    currentSprint,
    loading: storeLoading,
  } = useAppSelector((state: RootState) => state.projects);

  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  const currentSprintId =
    currentSprint?.id?.toString() || (currentSprint as any)?._id?.toString();

  // Screen Focus & Refetch Token State
  const [isFocused, setIsFocused] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSprintSwitchLoading, setIsSprintSwitchLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [assigneePage, setAssigneePage] = useState(1);
  const [isFilterApplying, setIsFilterApplying] = useState(false);
  const filterFetchStarted = useRef(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    assignee: [],
    status: [],
    priority: [],
    work_type: [],
  });

  const [taskPagination, setTaskPagination] = useState<
    Record<string, Record<string, ColumnTaskState>>
  >({});
  const taskPaginationRef = useRef(taskPagination);
  taskPaginationRef.current = taskPagination;

  const previousSprintId = useRef<string | undefined>(undefined);
  const hasStartedSprintFetch = useRef(false);

  // RTK Query hooks — reads from cache immediately if preloaded
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadUserStoryAttachment] = useUploadUserStoryAttachmentMutation();
  const [createUserStory, { isLoading: isCreatingStory }] =
    useCreateUserStoryMutation();

  const {
    currentData: boardStoriesResponse,
    isFetching: isBoardStoriesFetching,
    isLoading: isBoardStoriesLoading,
    isError: isBoardStoriesError,
    refetch: refetchBoardStories,
  } = useGetBoardStoriesQuery(
    isFocused && projectId
      ? {
          project_id: projectId,
          page: currentPage,
          page_size: 5,
          sprint_id: currentSprintId,
          tasks_per_status: 1,
          task_assignee_id:
            selectedFilters.assignee.length > 0
              ? selectedFilters.assignee.join(',')
              : undefined,
          task_status_id:
            selectedFilters.status.length > 0
              ? selectedFilters.status.join(',')
              : undefined,
          priority:
            selectedFilters.priority.length > 0
              ? selectedFilters.priority.join(',')
              : undefined,
          work_type:
            selectedFilters.work_type.length > 0
              ? selectedFilters.work_type.join(',')
              : undefined,
          _refetchKey: refetchKey,
        }
      : skipToken,
  );

  const boardStories = useMemo(
    () => boardStoriesResponse?.data ?? [],
    [boardStoriesResponse?.data],
  );
  const boardMeta = boardStoriesResponse?.meta ?? null;
  const boardColumns = useMemo<BoardStatusColumn[]>(() => {
    if (boardStories.length === 0) return [];
    return [...(boardStories[0].statuses || [])].sort(
      (a, b) => a.display_order - b.display_order,
    );
  }, [boardStories]);
  const { data: membersData, isFetching: isAssigneesFetching } = useGetProjectMembersQuery(
    isFocused && projectId
      ? {
          project_id: projectId,
          page: assigneePage,
          page_size: 10,
          _refetchKey: refetchKey,
        }
      : skipToken,
  );
  const projectMembers = membersData?.data ?? [];
  const [updateTask] = useUpdateTaskMutation();
  const [triggerGetStatusTasks] = useLazyGetBoardStatusTasksQuery();
  // Local State
  const [localUserStories, setLocalUserStories] = useState<BoardStory[]>([]);
  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<{
    storyId: string;
    statusId: string;
  } | null>(null);
  const [dropSuccessZone, setDropSuccessZone] = useState<{
    storyId: string;
    statusId: string;
  } | null>(null);

  const hasInitializedStories = useRef(false);

  type OptimisticAction =
    | { kind: 'story'; storyId: string; isFav: boolean }
    | { kind: 'task'; taskId: string; isFav: boolean };

  const [optimisticStories, addOptimisticUpdate] = useOptimistic<
    BoardStory[],
    OptimisticAction
  >(localUserStories, (current, action) => {
    if (action.kind === 'story') {
      return current.map(s =>
        s.id === action.storyId ? { ...s, is_favourite: action.isFav } : s,
      );
    }
    return current.map(s => ({
      ...s,
      statuses: s.statuses?.map(col => ({
        ...col,
        tasks: col.tasks?.map(t =>
          t.id === action.taskId ? { ...t, is_favourite: action.isFav } : t,
        ),
      })),
    }));
  });

  const appliedFiltersCount = useMemo(() => {
    return (
      selectedFilters.assignee.length +
      selectedFilters.status.length +
      selectedFilters.priority.length +
      selectedFilters.work_type.length
    );
    setTaskPagination({});
  }, [selectedFilters]);

  useEffect(() => {
    if (!isFilterApplying) return;
    if (isBoardStoriesFetching) filterFetchStarted.current = true;
    if (
      filterFetchStarted.current &&
      !isBoardStoriesFetching &&
      (boardStoriesResponse !== undefined || isBoardStoriesError)
    ) {
      setIsFilterApplying(false);
      filterFetchStarted.current = false;
    }
  }, [isFilterApplying, isBoardStoriesFetching, boardStoriesResponse, isBoardStoriesError]);
  const displayStories = useMemo(() => {
    const hasAssignee = selectedFilters.assignee.length > 0;
    const hasStatus = selectedFilters.status.length > 0;
    const hasPriority = selectedFilters.priority.length > 0;
    if (!hasAssignee && !hasStatus && !hasPriority) {
      return optimisticStories;
    }
    return optimisticStories
      .map(story => {
        const filteredStatuses = (story.statuses ?? []).map(col => {
          const matchingTasks = (col.tasks ?? []).filter(task => {
            const assigneeId = task.assignee?.id || task.assignee_id;
            const matchAssignee =
              !hasAssignee ||
              (assigneeId && selectedFilters.assignee.includes(assigneeId));
            const matchStatus =
              !hasStatus || selectedFilters.status.includes(task.status_id);
            const matchPriority =
              !hasPriority || selectedFilters.priority.includes(task.priority);

            return matchAssignee && matchStatus && matchPriority;
          });
          return {
            ...col,
            tasks: matchingTasks,
          };
        });
        const totalRemainingTasks = filteredStatuses.reduce(
          (sum, col) => sum + (col.tasks?.length ?? 0),
          0,
        );
        return {
          ...story,
          statuses: filteredStatuses,
          total_tasks: totalRemainingTasks,
        };
      })
      .filter(story => (story.total_tasks ?? 0) > 0);
  }, [optimisticStories, selectedFilters]);

  // Updated useFocusEffect to refresh without wiping preloaded cache
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setRefetchKey(prev => prev + 1);
      return () => setIsFocused(false);
    }, []),
  );

  // Reset pagination and local list on project or sprint changes
  useEffect(() => {
    const sprintChanged =
      previousSprintId.current !== undefined &&
      previousSprintId.current !== currentSprintId;
    if (sprintChanged) {
      setIsSprintSwitchLoading(true);
      hasStartedSprintFetch.current = false;
    }
    previousSprintId.current = currentSprintId;
    hasInitializedStories.current = false;
    setLocalUserStories([]);
    setDropZones([]);
    setActiveDropZone(null);
    setDropSuccessZone(null);
    setCurrentPage(1);
    setAssigneePage(1);
    setIsFetchingMore(false);
    setExpandedStories({});
    setTaskPagination({});
  }, [projectId, currentSprintId]);

  useEffect(() => {
    setCurrentPage(1);
    setIsFetchingMore(false);
    hasInitializedStories.current = false;
    setLocalUserStories([]);
  }, [selectedFilters]);

  useEffect(() => {
    if (!isSprintSwitchLoading) {
      hasStartedSprintFetch.current = false;
      return;
    }
    if (isBoardStoriesFetching) {
      hasStartedSprintFetch.current = true;
      return;
    }
    if (
      hasStartedSprintFetch.current &&
      (boardStoriesResponse !== undefined || isBoardStoriesError) &&
      currentPage === 1
    ) {
      setIsSprintSwitchLoading(false);
      hasStartedSprintFetch.current = false;
    }
  }, [
    isSprintSwitchLoading,
    isBoardStoriesFetching,
    boardStoriesResponse,
    isBoardStoriesError,
    currentPage,
  ]);

  // Seed / append from Redux into local list – is_favourite comes from the API
  useEffect(() => {
    if (!boardStories?.length && currentPage === 1) {
      if (!storeLoading && !isBoardStoriesFetching) {
        setLocalUserStories(prev => (prev.length > 0 ? [] : prev));
        hasInitializedStories.current = true;
      }
      return;
    }

    const currentPag = taskPaginationRef.current;
    const nextPagination: Record<string, Record<string, ColumnTaskState>> = {
      ...currentPag,
    };
    boardStories.forEach(story => {
      if (!nextPagination[story.id]) {
        nextPagination[story.id] = {};
      }
      (story.statuses || []).forEach(statusCol => {
        const existing = nextPagination[story.id][statusCol.status_id];
        const initialTasks = statusCol.tasks ?? [];
        const colTotal =
          statusCol.task_count ??
          (statusCol as any)?.total ??
          initialTasks.length;

        if (!existing) {
          nextPagination[story.id][statusCol.status_id] = {
            tasks: initialTasks,
            page: initialTasks.length > 0 ? 1 : 0,
            isLoading: false,
            hasNext: colTotal > initialTasks.length,
            totalCount: colTotal,
          };
        }
      });
    });
    setTaskPagination(nextPagination);
    const mergedStories = boardStories.map(story => ({
      ...story,
      statuses: (story.statuses || []).map(statusCol => ({
        ...statusCol,
        tasks:
          nextPagination[story.id]?.[statusCol.status_id]?.tasks ??
          statusCol.tasks ??
          [],
      })),
    }));

    if (!hasInitializedStories.current && boardStories.length > 0) {
      setLocalUserStories(mergedStories);
      hasInitializedStories.current = true;
      setIsFetchingMore(false);
    } else if (currentPage > 1) {
      setLocalUserStories(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const fresh = mergedStories.filter(s => !existingIds.has(s.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
      setIsFetchingMore(false);
    } else {
      setLocalUserStories(mergedStories);
      setIsFetchingMore(false);
    }
  }, [boardStories, currentPage, storeLoading, isBoardStoriesFetching]);

  const handleLoadMoreTasks = useCallback(
    async (storyId: string, statusId: string) => {
      if (!projectId) return;
      const columnState = taskPaginationRef.current[storyId]?.[statusId];
      if (columnState?.isLoading) return;
      if (columnState && columnState.page >= 1 && !columnState.hasNext) return;
      const nextPage = (columnState?.page ?? 1) + 1;
      setTaskPagination(prev => ({
        ...prev,
        [storyId]: {
          ...(prev[storyId] || {}),
          [statusId]: {
            ...(prev[storyId]?.[statusId] ?? {
              tasks: [],
              page: 1,
              totalCount: 0,
              hasNext: true,
            }),
            isLoading: true,
          },
        },
      }));
      try {
        const response = await triggerGetStatusTasks({
          project_id: projectId,
          user_story_id: storyId,
          status_id: statusId,
          page: nextPage,
          page_size: 3,
        }).unwrap();
        const storyData: BoardStory | undefined = response?.data;
        const fetchedTasks: BoardTask[] =
          storyData?.statuses
            ?.find(s => s.status_id === statusId)
            ?.tasks?.filter(t => t.status_id === statusId) ?? [];
        const total = response?.meta?.total ?? 0;
        const hasNextMeta = Boolean(response?.meta?.has_next);
        setTaskPagination(prev => {
          const currentTasks = prev[storyId]?.[statusId]?.tasks ?? [];
          const existingIds = new Set(currentTasks.map(t => t.id));
          const newTasks = fetchedTasks.filter(t => !existingIds.has(t.id));
          const updatedTasks = [...currentTasks, ...newTasks];
          const hasNext =
            hasNextMeta && (total === 0 || updatedTasks.length < total);
          return {
            ...prev,
            [storyId]: {
              ...(prev[storyId] || {}),
              [statusId]: {
                tasks: updatedTasks,
                page: nextPage,
                isLoading: false,
                hasNext,
                totalCount: total > 0 ? total : updatedTasks.length,
              },
            },
          };
        });
        setLocalUserStories(prev =>
          prev.map(story => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              statuses: (story.statuses || []).map(col => {
                if (col.status_id !== statusId) return col;
                const existingIds = new Set((col.tasks || []).map(t => t.id));
                const fresh = fetchedTasks.filter(t => !existingIds.has(t.id));
                return {
                  ...col,
                  task_count: total,
                  tasks: [...(col.tasks || []), ...fresh],
                };
              }),
            };
          }),
        );
      } catch {
        setTaskPagination(prev => ({
          ...prev,
          [storyId]: {
            ...(prev[storyId] || {}),
            [statusId]: {
              ...(prev[storyId]?.[statusId] ?? {
                tasks: [],
                page: 1,
                hasNext: false,
                totalCount: 0,
              }),
              isLoading: false,
            },
          },
        }));
        showSnackbar({
          message: 'Failed to load column tasks',
          type: 'error',
        });
      }
    },
    [projectId, triggerGetStatusTasks],
  );

  const loadNextPage = useCallback(() => {
    if (
      !isFocused ||
      !projectId ||
      !boardMeta?.has_next ||
      isBoardStoriesFetching ||
      isFetchingMore
    ) {
      return;
    }
    setIsFetchingMore(true);
    setCurrentPage(prev => prev + 1);
  }, [
    projectId,
    boardMeta?.has_next,
    isFocused,
    isBoardStoriesFetching,
    isFetchingMore,
  ]);

  const handleVerticalScroll = useCallback(
    (event: any) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const offsetY = contentOffset?.y ?? 0;
      const viewportHeight = layoutMeasurement?.height ?? 0;
      const totalContentHeight = contentSize?.height ?? 0;
      verticalScrollOffset.value = offsetY;
      const distanceFromBottom =
        totalContentHeight - (offsetY + viewportHeight);
      if (distanceFromBottom <= 500) {
        loadNextPage();
      }
    },
    [loadNextPage, verticalScrollOffset],
  );

  const toggleStory = useCallback((storyId: string) => {
    setExpandedStories(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  }, []);
  const handleCreateStory = async (
    payload: CreateUserStoryPayload,
    file?: StoryAttachmentFile,
  ) => {
    if (!projectId || !currentSprintId) {
      showSnackbar({
        message: 'Project or Sprint not selected',
        type: 'error',
      });
      return;
    }
    try {
      const response = await createUserStory({
        projectId,
        payload: {
          ...payload,
          sprint_id: currentSprintId,
        },
      }).unwrap();
      const userStoryId = response.data?.id;
      if (userStoryId && file) {
        await uploadUserStoryAttachment({
          projectId: String(projectId),
          userStoryId: String(userStoryId),
          file,
        });
      }
      refetchBoardStories();
    } catch (error) {
      showSnackbar({
        message: 'Failed to create user story',
        type: 'error',
      });
      throw error;
    }
  };

  const handleToggleStoryFavorite = useCallback(
    (storyId: string) => {
      if (!projectId) return;
      const story = optimisticStories.find(s => s.id === storyId);
      const currentFav = story?.is_favourite ?? false;

      startTransition(async () => {
        addOptimisticUpdate({ kind: 'story', storyId, isFav: !currentFav });

        try {
          if (currentFav) {
            await dispatch(
              unfavouriteUserStoryThunk({ projectId, userStoryId: storyId }),
            ).unwrap();
          } else {
            await dispatch(
              favouriteUserStoryThunk({ projectId, userStoryId: storyId }),
            ).unwrap();
          }

          setLocalUserStories(prev =>
            prev.map(s =>
              s.id === storyId ? { ...s, is_favourite: !currentFav } : s,
            ),
          );

          await refetchBoardStories(); // Optional short delay if backend eventual-consistency lags
        } catch {
          addOptimisticUpdate({ kind: 'story', storyId, isFav: currentFav });
          showSnackbar({
            message: 'Failed to update favourite',
            type: 'error',
          });
        }
      });
    },
    [dispatch, projectId, optimisticStories, addOptimisticUpdate],
  );

  const handleToggleTaskFavorite = useCallback(
    (_storyId: string, taskId: string) => {
      if (!projectId) return;
      let targetStoryId: string | undefined;
      let targetStatusId: string | undefined;
      let currentFav = false;
      for (const s of optimisticStories) {
        for (const col of s.statuses ?? []) {
          const found = (col.tasks ?? []).find(t => t?.id === taskId);
          if (found) {
            targetStoryId = s.id;
            targetStatusId = col.status_id;
            currentFav = !!found.is_favourite;
            break;
          }
        }
        if (targetStoryId) break;
      }

      startTransition(async () => {
        addOptimisticUpdate({ kind: 'task', taskId, isFav: !currentFav });

        try {
          if (currentFav) {
            await dispatch(
              unfavouriteTaskThunk({ projectId, taskId }),
            ).unwrap();
          } else {
            await dispatch(favouriteTaskThunk({ projectId, taskId })).unwrap();
          }

          setLocalUserStories(prev =>
            prev.map(s => {
              if (targetStoryId && s.id !== targetStoryId) return s;
              return {
                ...s,
                statuses: (s.statuses || []).map(col => ({
                  ...col,
                  tasks: (col.tasks || []).map(t =>
                    t?.id === taskId ? { ...t, is_favourite: !currentFav } : t,
                  ),
                })),
              };
            }),
          );
          if (targetStoryId && targetStatusId) {
            setTaskPagination(prev => {
              const storyCols = prev?.[targetStoryId!];
              const colState = storyCols?.[targetStatusId!];
              if (!colState || !Array.isArray(colState.tasks)) return prev;

              return {
                ...prev,
                [targetStoryId!]: {
                  ...storyCols,
                  [targetStatusId!]: {
                    ...colState,
                    tasks: colState.tasks.map(t =>
                      t?.id === taskId
                        ? { ...t, is_favourite: !currentFav }
                        : t,
                    ),
                  },
                },
              };
            });
          }

          await refetchBoardStories();
        } catch {
          addOptimisticUpdate({ kind: 'task', taskId, isFav: currentFav });
          showSnackbar({
            message: 'Failed to update favourite',
            type: 'error',
          });
        }
      });
    },
    [dispatch, projectId, optimisticStories, addOptimisticUpdate],
  );

  const registerTaskDropZone = useCallback((zone: DropZone) => {
    setDropZones(prev => {
      const index = prev.findIndex(
        item =>
          item.storyId === zone.storyId && item.statusId === zone.statusId,
      );
      if (index === -1) return [...prev, zone];
      const updated = [...prev];
      updated[index] = zone;
      return updated;
    });
  }, []);

  const findDropZone = useCallback(
    (absoluteX: number, absoluteY: number): DropZone | null => {
      const currentX = horizontalScrollOffset.value;
      const currentY = verticalScrollOffset.value;

      return (
        dropZones.find(item => {
          const adjustedX = item.x - (currentX - item.scrollXAtMeasure);
          const adjustedY = item.y - (currentY - item.scrollYAtMeasure);
          return (
            absoluteX >= adjustedX &&
            absoluteX <= adjustedX + item.width &&
            absoluteY >= adjustedY &&
            absoluteY <= adjustedY + item.height
          );
        }) ?? null
      );
    },
    [dropZones, horizontalScrollOffset, verticalScrollOffset],
  );

  const handleHoverDropZone = useCallback(
    (absoluteX: number, absoluteY: number) => {
      if (absoluteX < 0 || absoluteY < 0) {
        setActiveDropZone(current => (current ? null : current));
        return;
      }
      const zone = findDropZone(absoluteX, absoluteY);
      setActiveDropZone(current => {
        if (
          current?.storyId === zone?.storyId &&
          current?.statusId === zone?.statusId
        ) {
          return current;
        }
        return zone ? { storyId: zone.storyId, statusId: zone.statusId } : null;
      });
    },
    [findDropZone],
  );
  const handleDragPreview = useCallback((task: BoardTask | null) => {
    setDragPreviewTask(current =>
      task ? (current?.id === task.id ? current : task) : null,
    );
  }, []);

  const applyLocalMove = useCallback(
    (
      taskId: string,
      sourceStoryId: string,
      sourceStatusId: string,
      targetStoryId: string,
      targetStatusId: string,
    ) => {
      setLocalUserStories(prev => {
        let movedTask: BoardTask | null = null;
        for (const story of prev) {
          if (story.id === sourceStoryId) {
            for (const col of story.statuses || []) {
              if (col.status_id === sourceStatusId) {
                const found = col.tasks?.find(t => t.id === taskId);
                if (found) {
                  movedTask = { ...found, status_id: targetStatusId };
                  break;
                }
              }
            }
          }
        }

        if (!movedTask) return prev;

        setTaskPagination(prevPag => {
          const sourceCol = prevPag[sourceStoryId]?.[sourceStatusId];
          const targetCol = prevPag[targetStoryId]?.[targetStatusId];
          return {
            ...prevPag,
            [sourceStoryId]: {
              ...prevPag[sourceStoryId],
              ...(sourceCol
                ? {
                    [sourceStatusId]: {
                      ...sourceCol,
                      totalCount: Math.max(0, sourceCol.totalCount - 1),
                      tasks: (sourceCol.tasks ?? []).filter(
                        t => t.id !== taskId,
                      ),
                    },
                  }
                : {}),
            },
            [targetStoryId]: {
              ...prevPag[targetStoryId],
              ...(targetCol
                ? {
                    [targetStatusId]: {
                      ...targetCol,
                      totalCount: targetCol.totalCount + 1,
                      tasks: [...(targetCol.tasks ?? []), movedTask!],
                    },
                  }
                : {}),
            },
          };
        });

        return prev.map(story => {
          let updatedStatuses = story.statuses || [];
          let updatedTotalTasks = story.total_tasks;
          if (story.id === sourceStoryId) {
            updatedStatuses = updatedStatuses.map(col => {
              if (col.status_id === sourceStatusId) {
                return {
                  ...col,
                  task_count: Math.max(0, col.task_count - 1),
                  tasks: col.tasks.filter(t => t.id !== taskId),
                };
              }
              return col;
            });
            if (sourceStoryId !== targetStoryId) {
              updatedTotalTasks = Math.max(0, (story.total_tasks ?? 0) - 1);
            }
          }
          if (story.id === targetStoryId) {
            updatedStatuses = updatedStatuses.map(col => {
              if (col.status_id === targetStatusId) {
                return {
                  ...col,
                  task_count: col.task_count + 1,
                  tasks: [...col.tasks, movedTask!],
                };
              }
              return col;
            });
            if (sourceStoryId !== targetStoryId) {
              updatedTotalTasks = (story.total_tasks ?? 0) + 1;
            }
          }
          return {
            ...story,
            total_tasks: updatedTotalTasks,
            statuses: updatedStatuses,
          };
        });
      });
    },
    [],
  );

  const rollbackLocalMove = useCallback(
    (
      sourceTask: BoardTask,
      sourceStoryId: string,
      targetStoryId: string,
      sourceStatusId: string,
      targetStatusId: string,
    ) => {
      setLocalUserStories(prev => {
        setTaskPagination(prevPag => {
          const sourceCol = prevPag[sourceStoryId]?.[sourceStatusId];
          const targetCol = prevPag[targetStoryId]?.[targetStatusId];

          return {
            ...prevPag,
            [targetStoryId]: {
              ...prevPag[targetStoryId],
              ...(targetCol
                ? {
                    [targetStatusId]: {
                      ...targetCol,
                      totalCount: Math.max(0, targetCol.totalCount - 1),
                      tasks: (targetCol.tasks ?? []).filter(
                        t => t.id !== sourceTask.id,
                      ),
                    },
                  }
                : {}),
            },
            [sourceStoryId]: {
              ...prevPag[sourceStoryId],
              ...(sourceCol
                ? {
                    [sourceStatusId]: {
                      ...sourceCol,
                      totalCount: sourceCol.totalCount + 1,
                      tasks: [...(sourceCol.tasks ?? []), sourceTask],
                    },
                  }
                : {}),
            },
          };
        });

        return prev.map(story => {
          let updatedStatuses = story.statuses || [];
          let updatedTotalTasks = story.total_tasks;
          if (story.id === targetStoryId) {
            updatedStatuses = updatedStatuses.map(col => {
              if (col.status_id === targetStatusId) {
                return {
                  ...col,
                  task_count: Math.max(0, col.task_count - 1),
                  tasks: col.tasks.filter(t => t.id !== sourceTask.id),
                };
              }
              return col;
            });
            if (sourceStoryId !== targetStoryId) {
              updatedTotalTasks = Math.max(0, (story.total_tasks ?? 0) - 1);
            }
          }
          if (story.id === sourceStoryId) {
            updatedStatuses = updatedStatuses.map(col => {
              if (col.status_id === sourceStatusId) {
                return {
                  ...col,
                  task_count: col.task_count + 1,
                  tasks: [...col.tasks, sourceTask],
                };
              }
              return col;
            });
            if (sourceStoryId !== targetStoryId) {
              updatedTotalTasks = (story.total_tasks ?? 0) + 1;
            }
          }
          return {
            ...story,
            total_tasks: updatedTotalTasks,
            statuses: updatedStatuses,
          };
        });
      });
    },
    [],
  );

  const handleTaskDrop = useCallback(
    (
      task: BoardTask,
      sourceStoryId: string,
      sourceStatusId: string,
      absoluteX: number,
      absoluteY: number,
    ) => {
      setActiveDropZone(null);

      const targetZone = findDropZone(absoluteX, absoluteY);
      if (!targetZone) return;

      const { storyId: targetStoryId, statusId: targetStatusId } = targetZone;

      if (sourceStoryId === targetStoryId && sourceStatusId === targetStatusId)
        return;

      const sourceStory = localUserStories.find(s => s.id === sourceStoryId);
      const sourceCol = sourceStory?.statuses?.find(
        c => c.status_id === sourceStatusId,
      );
      const sourceTask = sourceCol?.tasks?.find(t => t.id === task.id);
      if (!sourceTask) return;

      setDropSuccessZone({ storyId: targetStoryId, statusId: targetStatusId });
      applyLocalMove(
        task.id,
        sourceStoryId,
        sourceStatusId,
        targetStoryId,
        targetStatusId,
      );

      if (!projectId) {
        setDropSuccessZone(null);
        return;
      }

      updateTask({
        projectId,
        taskId: task.id,
        payload: {
          user_story_id: targetStoryId,
          status_id: targetStatusId,
        },
      })
        .unwrap()
        .then(() => {
          setTimeout(() => setDropSuccessZone(null), 700);
        })
        .catch(() => {
          setDropSuccessZone(null);
          rollbackLocalMove(
            sourceTask,
            sourceStoryId,
            targetStoryId,
            sourceStatusId,
            targetStatusId,
          );
          showSnackbar({
            message: 'Failed to move task',
            type: 'error',
          });
        });
    },
    [
      findDropZone,
      localUserStories,
      projectId,
      applyLocalMove,
      rollbackLocalMove,
      updateTask,
    ],
  );

  return (
    <View
      ref={rootViewRef}
      onLayout={() =>
        rootViewRef.current?.measureInWindow((x, y) => setRootOrigin({ x, y }))
      }
      style={{
        flex: 1,
        backgroundColor: colors.surface,
      }}
    >
      <Animated.ScrollView
        ref={verticalScrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleVerticalScroll}
        style={{
          flex: 1,
          backgroundColor: colors.surface,
        }}
        contentContainerStyle={{
          paddingTop: moderateScale(20),
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.tightGap,
            paddingBottom: moderateScale(12),
          }}
        >
          <View className='flex-row items-start justify-between'>
            <View className='flex-1'>
              <AppText variant='title' className='font-bold'>
                Kanban Board
              </AppText>
              <AppText
                variant='body'
                style={{ marginTop: moderateScale(4), opacity: 0.5 }}
              >
                Visualize and manage your team's tasks across workflow stages
              </AppText>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFilterVisible(true)}
              className='ml-2 flex-row items-center'
              style={{
                backgroundColor: colors.primary,
                borderRadius: Radius.md,
                paddingHorizontal: moderateScale(10),
                paddingVertical: moderateScale(7),
              }}
            >
              <Ionicons
                name='filter-outline'
                size={moderateScale(16)}
                color={colors.white}
              />
              <AppText
                variant='caption'
                className='ml-1 font-bold'
                color={colors.white}
              >
                Filter{' '}
                {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ''}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          ref={horizontalScrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={event => {
            horizontalScrollOffset.value = event.nativeEvent.contentOffset.x;
          }}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.tightGap,
          }}
        >
          {isBoardStoriesLoading || isSprintSwitchLoading || isFilterApplying ? (
            <BoardSkeleton
              columnCount={Math.max(boardColumns.length ?? 0, 3)}
            />
          ) : (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{ width: moderateScale(250), padding: 12 }}
                  className='flex-row items-center justify-between'
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
                      User Stories
                    </AppText>
                    <View
                      className='items-center justify-center'
                      style={{
                        minWidth: moderateScale(22),
                        height: moderateScale(22),
                        paddingHorizontal: 6,
                        backgroundColor: colors.primary,
                        borderRadius: Radius.circle,
                      }}
                    >
                      <AppText
                        variant='caption'
                        className='text-xs font-bold'
                        color={colors.white}
                      >
                        {boardMeta?.total ?? displayStories.length}
                      </AppText>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    activeOpacity={0.8}
                    className='items-center justify-center'
                    style={{
                      width: moderateScale(22),
                      height: moderateScale(22),
                      borderRadius: Radius.circle,
                      backgroundColor: colors.primary,
                      elevation: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3,
                    }}
                  >
                    <Ionicons name='add' size={15} color={colors.white} />
                  </TouchableOpacity>
                </View>
                {boardColumns.map(status => (
                  <View
                    key={status.status_id}
                    style={{
                      width: moderateScale(260),
                      padding: 12,
                      borderLeftWidth: 1,
                      borderLeftColor: colors.border,
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: status.color,
                          marginRight: 8,
                        }}
                      />
                      <AppText variant='body' className='font-bold'>
                        {status.status_name}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>

              {displayStories.map(story => (
                <UserStoryBoardRow
                  key={story.id}
                  story={story}
                  projectId={projectId ?? ''}
                  columns={boardColumns}
                  expanded={!!expandedStories[story.id]}
                  onToggle={() => toggleStory(story.id)}
                  onRegisterDropZone={registerTaskDropZone}
                  onTaskDrop={handleTaskDrop}
                  onHoverDropZone={handleHoverDropZone}
                  onDragPreview={handleDragPreview}
                  dragPreviewTaskId={dragPreviewTask?.id ?? null}
                  onToggleStoryFavorite={handleToggleStoryFavorite}
                  onToggleTaskFavorite={handleToggleTaskFavorite}
                  activeDropZone={activeDropZone}
                  dropSuccessZone={dropSuccessZone}
                  horizontalScrollRef={horizontalScrollRef}
                  verticalScrollRef={verticalScrollRef}
                  horizontalScrollOffset={horizontalScrollOffset}
                  verticalScrollOffset={verticalScrollOffset}
                  dragPreviewX={dragPreviewX}
                  dragPreviewY={dragPreviewY}
                  taskPagination={taskPagination}
                  onLoadMoreTasks={handleLoadMoreTasks}
                  colors={colors}
                />
              ))}

              {isBoardStoriesFetching && currentPage > 1 && (
                <BoardSkeletonRow
                  columnCount={Math.max(boardColumns.length, 3)}
                />
              )}

              {!storeLoading &&
                !isBoardStoriesFetching &&
                !isFetchingMore &&
                displayStories.length === 0 && (
                  <View
                    style={{
                      paddingVertical: 48,
                      paddingHorizontal: 24,
                      alignItems: 'center',
                    }}
                  >
                    <AppText variant='body' color={colors.textSecondary}>
                      {appliedFiltersCount > 0
                        ? 'No user stories match the selected filter criteria.'
                        : 'No user stories found for this sprint.'}
                    </AppText>
                  </View>
                )}

              {isFetchingMore && (
                <View
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size='small' color={colors.primary} />
                </View>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </Animated.ScrollView>
      {dragPreviewTask && (
        <DragPreviewOverlay
          task={dragPreviewTask}
          projectId={projectId}
          colors={colors}
          dragX={dragPreviewX}
          dragY={dragPreviewY}
          originX={rootOrigin.x}
          originY={rootOrigin.y}
          width={moderateScale(244)}
          offsetX={moderateScale(130)}
          offsetY={moderateScale(34)}
        />
      )}
      <BoardFilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        members={projectMembers}
        statuses={
          boardColumns.map(c => ({
            id: c.status_id,
            name: c.status_name,
            color: c.color,
            display_order: c.display_order,
          })) as any
        }
        selectedFilters={selectedFilters}
        onLoadMoreAssignees={() => {
          if (membersData?.meta?.has_next && !isAssigneesFetching) {
            setAssigneePage(page => page + 1);
          }
        }}
        hasMoreAssignees={Boolean(membersData?.meta?.has_next)}
        isLoadingAssignees={isAssigneesFetching}
        onApplyFilters={filters => {
          const filtersChanged =
            JSON.stringify(filters) !== JSON.stringify(selectedFilters);
          if (filtersChanged && isFocused && projectId) {
            setIsFilterApplying(true);
            filterFetchStarted.current = false;
          }
          setCurrentPage(1);
          setIsFetchingMore(false);
          hasInitializedStories.current = false;
          setLocalUserStories([]);
          setSelectedFilters(filters);
        }}
      />
      <CreateProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        mode='story'
        title='Create Story'
        projectId={projectId}
        sprintId={currentSprintId}
        priorities={[...TASK_PRIORITY_OPTIONS]}
        onCreateStory={handleCreateStory}
        isCreatingStory={isCreatingStory}
        onSuccess={() => {
          setIsModalVisible(false);
          refetchBoardStories();
        }}
      />
    </View>
  );
};

export default ProjectDeatailsScreen;
