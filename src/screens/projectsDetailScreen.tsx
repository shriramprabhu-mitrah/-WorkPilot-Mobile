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
  useGetCustomStatusQuery,
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
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { DropZone, ColumnTaskState } from '../types/project.type';
import { UpdateTaskPayload } from '../types/task.type';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  useUpdateTaskMutation,
  useCreateUserStoryMutation,
  useUploadUserStoryAttachmentMutation,
  useGetTasksQuery,
} from '../store/api/userStoryApi';
import { TASK_PRIORITY_OPTIONS } from '../utils/enum';
import CreateProjectModal, {
  StoryAttachmentFile,
} from '../components/createProjectModel';
import BoardFilterModal, { SelectedFilters } from '../components/filterModal';
import { Radius } from '../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    transform: [
      { translateX: dragX.value - originX - offsetX },
      { translateY: dragY.value - originY - offsetY },
      { scale: 1.04 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents='none'
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          zIndex: 10000,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        animatedStyle,
      ]}
    >
      <TaskCard
        item={{
          id: task.id,
          title: task.title,
          priority: task.priority,
          points: `${task.story_points ?? 0}p`,
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

const CarouselDot = React.memo(
  ({
    index,
    color,
    snapOffsets,
    scrollX,
    onPress,
    isDark,
    dotInactiveWidth,
    dotActiveWidth,
    colStep,
    dotHeight,
    dotRadius,
  }: {
    index: number;
    color: string;
    snapOffsets: number[];
    scrollX: SharedValue<number>;
    onPress: () => void;
    isDark: boolean;
    dotInactiveWidth: number;
    dotActiveWidth: number;
    colStep: number;
    dotHeight: number;
    dotRadius: number;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const currentSnap = snapOffsets[index] ?? 0;
      const prevSnap =
        index > 0 ? snapOffsets[index - 1] : currentSnap - colStep;
      const nextSnap =
        index < snapOffsets.length - 1
          ? snapOffsets[index + 1]
          : currentSnap + colStep;

      const width = interpolate(
        scrollX.value,
        [prevSnap, currentSnap, nextSnap],
        [dotInactiveWidth, dotActiveWidth, dotInactiveWidth],
        Extrapolation.CLAMP,
      );

      const opacity = interpolate(
        scrollX.value,
        [prevSnap, currentSnap, nextSnap],
        [isDark ? 0.3 : 0.22, 1, isDark ? 0.3 : 0.22],
        Extrapolation.CLAMP,
      );

      return {
        width,
        opacity,
      };
    });

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      >
        <Animated.View
          style={[
            {
              height: dotHeight,
              borderRadius: dotRadius,
              backgroundColor: color,
            },
            animatedStyle,
          ]}
        />
      </TouchableOpacity>
    );
  },
);

const ProjectDeatailsScreen = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const isDark = colors.background !== '#FFFFFF';
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const outerViewportHeightRef = useRef(0);
  const outerContentHeightRef = useRef(0);
  const horizontalScrollOffset = useSharedValue(0);
  const verticalScrollOffset = useSharedValue(0);
  const [dragPreviewTask, setDragPreviewTask] = useState<BoardTask | null>(
    null,
  );
  const dragPreviewTaskRef = useRef<BoardTask | null>(null);
  const hasInitializedStoryless = useRef(false);
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

  const rawSprintId =
    currentSprint?.id?.toString() || (currentSprint as any)?._id?.toString();

  const currentSprintId =
    rawSprintId === 'all' || !rawSprintId ? undefined : rawSprintId;

  // Screen Focus & Refetch Token State
  const [isFocused, setIsFocused] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const [boardRefetchKey, setBoardRefetchKey] = useState(0);
  const handledBoardRefetchKeyRef = useRef(boardRefetchKey);

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
  const loadingTaskColumnsRef = useRef<Set<string>>(new Set());
  const taskLocationOverridesRef = useRef<
    Map<string, { storyId: string; statusId: string }>
  >(new Map());
  const taskMoveVersionRef = useRef(0);

  const previousSprintId = useRef<string | undefined>(undefined);
  const hasStartedSprintFetch = useRef(false);

  // RTK Query hooks — reads from cache immediately if preloaded
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadUserStoryAttachment] = useUploadUserStoryAttachmentMutation();
  const [createUserStory, { isLoading: isCreatingStory }] =
    useCreateUserStoryMutation();

  const {
    data: boardStoriesResponse,
    isFetching: isBoardStoriesFetching,
    isLoading: isBoardStoriesLoading,
    isError: isBoardStoriesError,
    refetch: refetchBoardStories,
  } = useGetBoardStoriesQuery(
    isFocused && projectId
      ? {
          project_id: projectId,
          page: currentPage,
          page_size: 10,
          sprint_id: currentSprintId,
          tasks_per_status: 5,
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
        }
      : skipToken,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: storylessTasksResponse,
    isFetching: isStorylessTasksFetching,
    isLoading: isStorylessTasksLoading,
    isError: isStorylessTasksError,
    refetch: refetchStorylessTasks,
  } = useGetTasksQuery(
    isFocused && projectId
      ? {
          projectId,
          sprint_id: currentSprintId,
          storyless_task: true,
          page: 1,
          page_size: 100,
          status_id:
            selectedFilters.status.length > 0
              ? selectedFilters.status.join(',')
              : undefined,
          assignee_id:
            selectedFilters.assignee.length > 0
              ? selectedFilters.assignee.join(',')
              : undefined,
          priority:
            selectedFilters.priority.length > 0
              ? selectedFilters.priority.join(',')
              : undefined,
          type:
            selectedFilters.work_type.length > 0
              ? selectedFilters.work_type.join(',')
              : undefined,
          _refetchKey: refetchKey + boardRefetchKey,
        }
      : skipToken,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const { data: customStatusData } = useGetCustomStatusQuery(
    isFocused && projectId
      ? {
          project_id: projectId,
          _refetchKey: refetchKey,
        }
      : skipToken,
  );

  const boardStories = useMemo(
    () => boardStoriesResponse?.data ?? [],
    [boardStoriesResponse?.data],
  );
  const filterResponseAtStartRef = useRef(boardStoriesResponse);
  const boardMeta = boardStoriesResponse?.meta ?? null;
  const boardColumns = useMemo<BoardStatusColumn[]>(() => {
    if (boardStories.length > 0 && (boardStories[0].statuses || []).length > 0) {
      return [...(boardStories[0].statuses || [])].sort(
        (a, b) => a.display_order - b.display_order,
      );
    }
    if (customStatusData?.data && customStatusData.data.length > 0) {
      return [...customStatusData.data]
        .sort((a, b) => a.display_order - b.display_order)
        .map(s => ({
          status_id: s.id,
          status_name: s.name,
          color: s.color,
          display_order: s.display_order,
          task_count: 0,
          tasks: [],
          meta: { page: 1, page_size: 5, total: 0, has_next: false },
        }));
    }
    return [];
  }, [boardStories, customStatusData?.data]);
  const { data: membersData, isFetching: isAssigneesFetching } =
    useGetProjectMembersQuery(
      isFocused && projectId
        ? {
            project_id: projectId,
            _refetchKey: refetchKey,
          }
        : skipToken,
    );
  const projectMembers = membersData?.data ?? [];
  const [updateTask] = useUpdateTaskMutation();
  const [triggerGetStatusTasks] = useLazyGetBoardStatusTasksQuery();
  // Local State
  const [localUserStories, setLocalUserStories] = useState<BoardStory[]>([]);
  const [localStorylessTasks, setLocalStorylessTasks] = useState<BoardTask[]>(
    [],
  );

  useEffect(() => {
    if (storylessTasksResponse?.data) {
      const rawTasks = storylessTasksResponse.data;
      const mapped: BoardTask[] = rawTasks.map(t => {
        const override = taskLocationOverridesRef.current.get(String(t.id));
        const effectiveStatusId =
          override && override.storyId === 'storyless'
            ? override.statusId
            : t.status_id;
        if (override && String(t.status_id) === String(override.statusId)) {
          taskLocationOverridesRef.current.delete(String(t.id));
        }
        const targetCol = boardColumns.find(
          c => c.status_id === effectiveStatusId,
        );
        return {
          id: String(t.id),
          project_id: t.project_id || projectId || '',
          project_name: (t as any).project_name || '',
          sprint_id: t.sprint_id,
          sprint_name: t.sprint_name || '',
          user_story_id: 'storyless',
          user_story_title: 'Storyless Tasks',
          key: t.key || (t as any).task_key || '',
          serial_number: t.serial_number ?? 0,
          formatted_serial_number: t.formatted_serial_number || '',
          title: t.title || '',
          description: t.description,
          type: t.type || 'task',
          priority: t.priority || 'medium',
          status_id: effectiveStatusId,
          status: targetCol?.status_name || t.status || '',
          status_color: targetCol?.color || t.status_color || '',
          is_final: !!t.is_final,
          is_favourite: !!(t as any).is_favourite,
          reporter_id: t.reporter_id || '',
          reporter_name: t.reporter_name || '',
          assignee_id: t.assignee_id ?? undefined,
          assignee_name: t.assignee_name || (t.assignee?.name ?? undefined),
          story_points: t.story_points ?? 0,
          due_date: t.due_date || '',
          estimated_hours: t.estimated_hours,
          actual_hours: t.actual_hours,
          created_at: t.created_at || '',
          updated_at: t.updated_at || '',
          reporter: {
            id: t.reporter?.id || t.reporter_id || '',
            name: t.reporter?.name || t.reporter_name || '',
            email: t.reporter?.email || '',
            avatar_url: t.reporter?.avatar_url || null,
            color: (t.reporter as any)?.color || '',
            role: t.reporter?.role || '',
          },
          assignee: t.assignee
            ? {
                id: t.assignee.id,
                name: t.assignee.name,
                email: t.assignee.email,
                avatar_url: t.assignee.avatar_url || null,
                color: (t.assignee as any).color || '',
                role: t.assignee.role,
              }
            : null,
        };
      });
      setLocalStorylessTasks(mapped);
      hasInitializedStoryless.current = true;
    } else if (storylessTasksResponse && !storylessTasksResponse.data) {
      setLocalStorylessTasks([]);
      hasInitializedStoryless.current = true;
    }
  }, [storylessTasksResponse, projectId, boardColumns]);

  const storylessStory = useMemo<BoardStory>(() => {
    return {
      id: 'storyless',
      project_id: projectId || '',
      title: 'Storyless Tasks',
      key: 'TASKS',
      serial_number: 0,
      description: 'Tasks not associated with any user story',
      priority: 'medium',
      is_favourite: false,
      story_points: localStorylessTasks.reduce(
        (sum, t) => sum + (t.story_points || 0),
        0,
      ),
      total_tasks: localStorylessTasks.length,
      completed_tasks: localStorylessTasks.filter(t => t.is_final).length,
      progress: 0,
      assignee: null,
      reporter: {
        id: '',
        name: 'System',
        email: '',
        avatar_url: null,
        color: '',
        role: '',
      },
      due_date: '',
      status_id: '',
      status: '',
      status_color: colors.primary,
      created_at: '',
      updated_at: '',
      statuses: boardColumns.map(col => {
        const tasksInCol = localStorylessTasks.filter(
          t => t.status_id === col.status_id,
        );
        return {
          status_id: col.status_id,
          status_name: col.status_name,
          color: col.color,
          display_order: col.display_order,
          task_count: tasksInCol.length,
          tasks: tasksInCol,
          meta: {
            page: 1,
            page_size: Math.max(tasksInCol.length, 5),
            total: tasksInCol.length,
            has_next: false,
          },
        };
      }),
    };
  }, [localStorylessTasks, projectId, boardColumns, colors.primary]);

  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});
  const loadedStoriesRef = useRef<Set<string>>(new Set());
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

  useEffect(() => {
    if (handledBoardRefetchKeyRef.current === boardRefetchKey) return;
    handledBoardRefetchKeyRef.current = boardRefetchKey;
    if (!isFocused || !projectId) return;

    refetchBoardStories()
      .unwrap()
      .then(response => {
        const stories = response?.data ?? [];
        const refreshedPagination: Record<
          string,
          Record<string, ColumnTaskState>
        > = {};

        stories.forEach(story => {
          refreshedPagination[story.id] = {};
          (story.statuses ?? []).forEach(status => {
            const tasks = status.tasks ?? [];
            const totalCount =
              status.meta?.total ?? status.task_count ?? tasks.length;
            refreshedPagination[story.id][status.status_id] = {
              tasks,
              page: status.meta?.page ?? (tasks.length > 0 ? 1 : 0),
              isLoading: false,
              hasNext: status.meta?.has_next ?? totalCount > tasks.length,
              totalCount,
            };
          });
        });

        setTaskPagination(refreshedPagination);
        setLocalUserStories(
          stories.map(story => ({
            ...story,
            statuses: (story.statuses ?? []).map(status => ({
              ...status,
              tasks:
                refreshedPagination[story.id]?.[status.status_id]?.tasks ??
                status.tasks ??
                [],
            })),
          })),
        );
        hasInitializedStories.current = true;
        setIsFetchingMore(false);
      })
      .catch(() => {
        showSnackbar({
          message: 'Failed to refresh board',
          type: 'error',
        });
      })
      .finally(() => {
        setIsFilterApplying(false);
        filterFetchStarted.current = false;
      });
    refetchStorylessTasks();
  }, [boardRefetchKey, isFocused, projectId, refetchBoardStories, refetchStorylessTasks]);

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
  }, [selectedFilters]);

  useEffect(() => {
    if (!isFilterApplying) return;
    if (isBoardStoriesFetching || isStorylessTasksFetching) {
      filterFetchStarted.current = true;
    }
    if (
      !isBoardStoriesFetching &&
      !isStorylessTasksFetching &&
      (isBoardStoriesError ||
        filterFetchStarted.current ||
        (boardStoriesResponse !== undefined &&
          boardStoriesResponse !== filterResponseAtStartRef.current))
    ) {
      setIsFilterApplying(false);
      filterFetchStarted.current = false;
    }
  }, [
    isFilterApplying,
    isBoardStoriesFetching,
    isStorylessTasksFetching,
    boardStoriesResponse,
    isBoardStoriesError,
  ]);
  const displayStories = useMemo(() => {
    return [storylessStory, ...optimisticStories];
  }, [storylessStory, optimisticStories]);

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
      previousSprintId.current !== rawSprintId;
    if (sprintChanged) {
      setIsSprintSwitchLoading(true);
      hasStartedSprintFetch.current = false;
    }
    previousSprintId.current = rawSprintId;
    hasInitializedStories.current = false;
    hasInitializedStoryless.current = false;
    lastRequestedPageRef.current = 1;
    setLocalUserStories([]);
    setDropZones([]);
    setActiveDropZone(null);
    setDropSuccessZone(null);
    setCurrentPage(1);
    setAssigneePage(1);
    setIsFetchingMore(false);
    setExpandedStories({});
    setLocalStorylessTasks([]);
    setTaskPagination({});
    taskLocationOverridesRef.current.clear();
    taskMoveVersionRef.current += 1;
  }, [projectId, rawSprintId]);

  useEffect(() => {
    loadedStoriesRef.current.clear();
    lastRequestedPageRef.current = 1;
    setCurrentPage(1);
    setIsFetchingMore(false);
    hasInitializedStories.current = false;
    hasInitializedStoryless.current = false;
    setTaskPagination({});
  }, [selectedFilters]);

  useEffect(() => {
    if (!isSprintSwitchLoading) {
      hasStartedSprintFetch.current = false;
      return;
    }
    if (isBoardStoriesFetching || isStorylessTasksFetching) {
      hasStartedSprintFetch.current = true;
      return;
    }
    if (
      hasStartedSprintFetch.current &&
      (boardStoriesResponse !== undefined || isBoardStoriesError) &&
      (storylessTasksResponse !== undefined || isStorylessTasksError) &&
      currentPage === 1
    ) {
      setIsSprintSwitchLoading(false);
      hasStartedSprintFetch.current = false;
    }
  }, [
    isSprintSwitchLoading,
    isBoardStoriesFetching,
    isStorylessTasksFetching,
    boardStoriesResponse,
    storylessTasksResponse,
    isBoardStoriesError,
    isStorylessTasksError,
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
        const initialTasks = (statusCol.tasks ?? []).filter(task => {
          const override = taskLocationOverridesRef.current.get(String(task.id));
          if (!override) return true;
          if (
            String(override.statusId) === String(statusCol.status_id) &&
            String(override.storyId) === String(story.id)
          ) {
            taskLocationOverridesRef.current.delete(String(task.id));
            return true;
          }
          return false;
        });
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
        } else {
          const filteredExisting = existing.tasks.filter(task => {
            const override = taskLocationOverridesRef.current.get(String(task.id));
            if (!override) return true;
            return (
              String(override.statusId) === String(statusCol.status_id) &&
              String(override.storyId) === String(story.id)
            );
          });
          const existingIds = new Set(filteredExisting.map(t => String(t.id)));
          const mergedTasks = [...filteredExisting];
          initialTasks.forEach(t => {
            if (!existingIds.has(String(t.id))) {
              mergedTasks.push(t);
              existingIds.add(String(t.id));
            }
          });
          nextPagination[story.id][statusCol.status_id] = {
            ...existing,
            tasks: mergedTasks,
            totalCount: Math.max(colTotal, mergedTasks.length),
            hasNext: colTotal > mergedTasks.length,
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

    setLocalUserStories(prev => {
      if (prev.length === 0) return mergedStories;
      const prevMap = new Map(prev.map(s => [s.id, s]));
      return mergedStories.map(story => {
        const existing = prevMap.get(story.id);
        if (!existing) return story;
        return {
          ...story,
          is_favourite: existing.is_favourite ?? story.is_favourite,
        };
      });
    });
    hasInitializedStories.current = true;
    setIsFetchingMore(false);
  }, [boardStories, storeLoading, isBoardStoriesFetching]);

  const handleLoadMoreTasks = useCallback(
    async (storyId: string, statusId: string) => {
      if (!projectId) return;
      const columnKey = `${storyId}:${statusId}`;
      if (loadingTaskColumnsRef.current.has(columnKey)) return;
      const columnState = taskPaginationRef.current[storyId]?.[statusId];
      if (columnState?.isLoading) return;
      if (columnState && columnState.page >= 1 && !columnState.hasNext) return;
      const nextPage = columnState ? Math.max(1, columnState.page + 1) : 1;
      const moveVersionAtRequest = taskMoveVersionRef.current;
      loadingTaskColumnsRef.current.add(columnKey);
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
          page_size: 5,
        }).unwrap();
        const storyData: BoardStory | undefined = response?.data;
        const fetchedTasks: BoardTask[] =
          storyData?.statuses
            ?.find(s => s.status_id === statusId)
            ?.tasks?.filter(task => {
              if (
                task.status_id !== statusId ||
                task.user_story_id !== storyId
              ) {
                return false;
              }
              const override = taskLocationOverridesRef.current.get(task.id);
              return (
                !override ||
                (override.storyId === storyId && override.statusId === statusId)
              );
            }) ?? [];
        const total = response?.meta?.total ?? 0;
        const hasNextMeta = Boolean(response?.meta?.has_next);
        const moveOccurredDuringRequest =
          moveVersionAtRequest !== taskMoveVersionRef.current;
        setTaskPagination(prev => {
          const currentState = prev[storyId]?.[statusId];
          const currentTasks = currentState?.tasks ?? [];
          const existingIds = new Set(currentTasks.map(t => t.id));
          const newTasks = fetchedTasks.filter(t => !existingIds.has(t.id));
          const updatedTasks = [...currentTasks, ...newTasks];
          const totalCount = moveOccurredDuringRequest
            ? (currentState?.totalCount ?? total)
            : total > 0
              ? total
              : hasNextMeta
                ? Math.max(
                    currentState?.totalCount ?? 0,
                    updatedTasks.length + 1,
                  )
                : updatedTasks.length;
          const hasNext = moveOccurredDuringRequest
            ? (currentState?.hasNext ?? hasNextMeta)
            : hasNextMeta && (total === 0 || updatedTasks.length < total);
          return {
            ...prev,
            [storyId]: {
              ...(prev[storyId] || {}),
              [statusId]: {
                tasks: updatedTasks,
                page: nextPage,
                isLoading: false,
                hasNext,
                totalCount,
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
                  task_count:
                    moveOccurredDuringRequest || total <= 0
                      ? col.task_count
                      : total,
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
                hasNext: true,
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
      } finally {
        loadingTaskColumnsRef.current.delete(columnKey);
      }
    },
    [projectId, triggerGetStatusTasks],
  );

  const lastRequestedPageRef = useRef(1);

  const hasNextPage = useMemo(() => {
    if (!boardMeta) return false;
    if (boardMeta.has_next !== undefined) return Boolean(boardMeta.has_next);
    if (boardMeta.total_pages !== undefined)
      return currentPage < boardMeta.total_pages;
    const totalCount = boardMeta.total ?? boardMeta.total_items;
    if (totalCount !== undefined) {
      const currentCount =
        boardStories.length > 0 ? boardStories.length : localUserStories.length;
      return currentCount < totalCount;
    }
    return false;
  }, [boardMeta, currentPage, boardStories.length, localUserStories.length]);

  const loadNextPage = useCallback(() => {
    if (
      !isFocused ||
      !projectId ||
      !hasNextPage ||
      isBoardStoriesFetching ||
      isFetchingMore
    ) {
      return;
    }
    const nextPage = currentPage + 1;
    if (lastRequestedPageRef.current === nextPage) return;
    lastRequestedPageRef.current = nextPage;
    setIsFetchingMore(true);
    setCurrentPage(nextPage);
  }, [
    isFocused,
    projectId,
    hasNextPage,
    isBoardStoriesFetching,
    isFetchingMore,
    currentPage,
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
      if (distanceFromBottom <= 400) {
        loadNextPage();
      }
    },
    [loadNextPage, verticalScrollOffset],
  );

  const loadStoriesWhenBoardDoesNotScroll = useCallback(() => {
    if (
      outerViewportHeightRef.current > 0 &&
      outerContentHeightRef.current <= outerViewportHeightRef.current + 100 &&
      hasNextPage &&
      !isBoardStoriesFetching &&
      !isFetchingMore
    ) {
      loadNextPage();
    }
  }, [hasNextPage, isBoardStoriesFetching, isFetchingMore, loadNextPage]);

  const snapOffsets = useMemo(() => {
    const userStoryColWidth = moderateScale(250);
    const statusColWidth = moderateScale(260);
    const offsets = [0];
    for (let i = 0; i < boardColumns.length; i++) {
      offsets.push(userStoryColWidth + i * statusColWidth);
    }
    return offsets;
  }, [boardColumns.length, moderateScale]);

  const carouselItems = useMemo(() => {
    return [
      {
        key: 'user-stories',
        color: colors.primary,
        title: 'User Stories',
      },
      ...boardColumns.map(col => ({
        key: col.status_id,
        color: col.color || colors.primary,
        title: col.status_name,
      })),
    ];
  }, [boardColumns, colors.primary]);

  const dotInactiveWidth = moderateScale(7);
  const dotActiveWidth = moderateScale(18);
  const colStep = moderateScale(260);
  const dotHeight = moderateScale(7);
  const dotRadius = moderateScale(3.5);

  const scrollToColumn = useCallback(
    (index: number) => {
      const targetX = snapOffsets[index] ?? 0;
      horizontalScrollRef.current?.scrollTo({
        x: targetX,
        y: 0,
        animated: true,
      });
    },
    [horizontalScrollRef, snapOffsets],
  );

  const handleHorizontalScroll = useAnimatedScrollHandler({
    onScroll: event => {
      horizontalScrollOffset.value = event.contentOffset.x;
    },
  });

  const toggleStory = useCallback((storyId: string) => {
    setExpandedStories(prev => {
      const isCurrentlyExpanded = Boolean(prev[storyId]);
      return { ...prev, [storyId]: !isCurrentlyExpanded };
    });
  }, []);
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
        projectId,
        payload: {
          ...payload,
          ...(currentSprintId ? { sprint_id: currentSprintId } : {}),
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
      refetchStorylessTasks();
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
      for (const s of displayStories) {
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

        setLocalStorylessTasks(prev =>
          prev.map(t =>
            t.id === taskId ? { ...t, is_favourite: !currentFav } : t,
          ),
        );

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
          refetchStorylessTasks();
        } catch {
          addOptimisticUpdate({ kind: 'task', taskId, isFav: currentFav });
          showSnackbar({
            message: 'Failed to update favourite',
            type: 'error',
          });
        }
      });
    },
    [dispatch, projectId, displayStories, addOptimisticUpdate, refetchStorylessTasks],
  );

  const registerTaskDropZone = useCallback((zone: DropZone) => {
    setDropZones(prev => {
      const index = prev.findIndex(
        item =>
          item.storyId === zone.storyId && item.statusId === zone.statusId,
      );
      if (index === -1) return [...prev, zone];
      const existing = prev[index];
      if (
        Math.abs(existing.x - zone.x) < 1 &&
        Math.abs(existing.y - zone.y) < 1 &&
        Math.abs(existing.width - zone.width) < 1 &&
        Math.abs(existing.height - zone.height) < 1 &&
        Math.abs(existing.scrollXAtMeasure - zone.scrollXAtMeasure) < 1 &&
        Math.abs(existing.scrollYAtMeasure - zone.scrollYAtMeasure) < 1
      ) {
        return prev;
      }
      const updated = [...prev];
      updated[index] = zone;
      return updated;
    });
  }, []);

  const findDropZone = useCallback(
    (
      absoluteX: number,
      absoluteY: number,
      preferredStoryId?: string,
    ): DropZone | null => {
      const currentX = horizontalScrollOffset.value;
      const currentY = verticalScrollOffset.value;

      if (preferredStoryId) {
        const preferredMatch = dropZones.find(item => {
          if (item.storyId !== preferredStoryId) return false;
          const adjustedX = item.x - (currentX - item.scrollXAtMeasure);
          const adjustedY = item.y - (currentY - item.scrollYAtMeasure);
          return (
            absoluteX >= adjustedX &&
            absoluteX <= adjustedX + item.width &&
            absoluteY >= adjustedY - 50 &&
            absoluteY <= adjustedY + item.height + 50
          );
        });
        if (preferredMatch) return preferredMatch;

        if (preferredStoryId === 'storyless') {
          const xMatchInStoryless = dropZones.find(item => {
            if (item.storyId !== 'storyless') return false;
            const adjustedX = item.x - (currentX - item.scrollXAtMeasure);
            return (
              absoluteX >= adjustedX &&
              absoluteX <= adjustedX + item.width
            );
          });
          if (xMatchInStoryless) return xMatchInStoryless;
        }
      }

      return (
        dropZones.find(item => {
          const adjustedX = item.x - (currentX - item.scrollXAtMeasure);
          const adjustedY = item.y - (currentY - item.scrollYAtMeasure);
          return (
            absoluteX >= adjustedX &&
            absoluteX <= adjustedX + item.width &&
            absoluteY >= adjustedY - 25 &&
            absoluteY <= adjustedY + item.height + 25
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
      const activeTask = dragPreviewTaskRef.current;
      const isStoryless =
        activeTask &&
        (!activeTask.user_story_id || activeTask.user_story_id === 'storyless');
      const preferredStoryId = isStoryless
        ? 'storyless'
        : activeTask?.user_story_id;

      const zone = findDropZone(absoluteX, absoluteY, preferredStoryId);
      setActiveDropZone(current => {
        let zoneStoryId = isStoryless ? 'storyless' : zone?.storyId;
        let zoneStatusId = zone?.statusId;

        if (isStoryless && !zoneStatusId) {
          const currentX = horizontalScrollOffset.value;
          const xInContent =
            absoluteX - rootOrigin.x + currentX - moderateScale(250);
          if (xInContent >= 0) {
            const colIndex = Math.floor(xInContent / moderateScale(260));
            if (colIndex >= 0 && colIndex < boardColumns.length) {
              zoneStatusId = boardColumns[colIndex].status_id;
            }
          }
        }

        if (!zoneStoryId || !zoneStatusId) {
          return null;
        }

        if (
          current?.storyId === zoneStoryId &&
          current?.statusId === zoneStatusId
        ) {
          return current;
        }
        return { storyId: zoneStoryId, statusId: zoneStatusId };
      });
    },
    [
      findDropZone,
      horizontalScrollOffset,
      rootOrigin.x,
      moderateScale,
      boardColumns,
    ],
  );
  const handleDragPreview = useCallback((task: BoardTask | null) => {
    dragPreviewTaskRef.current = task;
    setDragPreviewTask(current =>
      task ? (current?.id === task.id ? current : task) : null,
    );
  }, []);

  const applyLocalMove = useCallback(
    (
      sourceTask: BoardTask,
      sourceStoryId: string,
      sourceStatusId: string,
      targetStoryId: string,
      targetStatusId: string,
    ) => {
      const targetCol = boardColumns.find(c => c.status_id === targetStatusId);
      const movedTask: BoardTask = {
        ...sourceTask,
        id: String(sourceTask.id),
        user_story_id:
          targetStoryId === 'storyless' ? 'storyless' : targetStoryId,
        status_id: targetStatusId,
        status: targetCol?.status_name || sourceTask.status,
        status_color: targetCol?.color || sourceTask.status_color,
      };
      taskLocationOverridesRef.current.set(String(sourceTask.id), {
        storyId: targetStoryId,
        statusId: targetStatusId,
      });
      taskMoveVersionRef.current += 1;

      if (sourceStoryId === 'storyless' || targetStoryId === 'storyless') {
        setLocalStorylessTasks(prev => {
          const filtered = prev.filter(
            t => String(t.id) !== String(sourceTask.id),
          );
          if (targetStoryId === 'storyless') {
            filtered.push(movedTask);
          }
          return filtered;
        });
      }

      setTaskPagination(prev => {
        const next: Record<string, Record<string, ColumnTaskState>> = {};
        for (const [storyId, columns] of Object.entries(prev)) {
          next[storyId] = {};
          for (const [statusId, state] of Object.entries(columns)) {
            const isSourceCol =
              String(storyId) === String(sourceStoryId) &&
              String(statusId) === String(sourceStatusId);
            next[storyId][statusId] = {
              ...state,
              tasks: state.tasks.filter(
                t => String(t.id) !== String(sourceTask.id),
              ),
              totalCount: isSourceCol
                ? Math.max(0, state.totalCount - 1)
                : state.totalCount,
            };
          }
        }
        if (targetStoryId !== 'storyless') {
          if (!next[targetStoryId]) {
            next[targetStoryId] = {};
          }
          const currentTarget = next[targetStoryId][targetStatusId] ?? {
            page: 1,
            isLoading: false,
            hasNext: false,
            totalCount: 0,
            tasks: [],
          };
          next[targetStoryId][targetStatusId] = {
            ...currentTarget,
            totalCount: currentTarget.totalCount + 1,
            tasks: [
              ...currentTarget.tasks.filter(
                t => String(t.id) !== String(sourceTask.id),
              ),
              movedTask,
            ],
          };
        }
        return next;
      });

      if (targetStoryId !== 'storyless' || sourceStoryId !== 'storyless') {
        setLocalUserStories(prev =>
          prev.map(story => {
            const isSource = String(story.id) === String(sourceStoryId);
            const isTarget = String(story.id) === String(targetStoryId);
            if (!isSource && !isTarget) return story;

            return {
              ...story,
              total_tasks:
                sourceStoryId === targetStoryId
                  ? story.total_tasks
                  : isSource
                    ? Math.max(0, (story.total_tasks ?? 0) - 1)
                    : (story.total_tasks ?? 0) + 1,
              statuses: (story.statuses ?? []).map(column => {
                const wasSource =
                  isSource && String(column.status_id) === String(sourceStatusId);
                const isDestination =
                  isTarget && String(column.status_id) === String(targetStatusId);
                const tasks = (column.tasks ?? []).filter(
                  task => String(task.id) !== String(sourceTask.id),
                );
                return {
                  ...column,
                  task_count: wasSource
                    ? Math.max(0, column.task_count - 1)
                    : isDestination &&
                        !(sourceStoryId === targetStoryId && wasSource)
                      ? column.task_count + 1
                      : column.task_count,
                  tasks: isDestination ? [...tasks, movedTask] : tasks,
                };
              }),
            };
          }),
        );
      }
    },
    [boardColumns],
  );

  const rollbackLocalMove = useCallback(
    (
      sourceTask: BoardTask,
      sourceStoryId: string,
      targetStoryId: string,
      sourceStatusId: string,
      targetStatusId: string,
    ) => {
      taskLocationOverridesRef.current.delete(String(sourceTask.id));
      taskMoveVersionRef.current += 1;

      const sourceCol = boardColumns.find(c => c.status_id === sourceStatusId);
      const restoredTask: BoardTask = {
        ...sourceTask,
        id: String(sourceTask.id),
        user_story_id:
          sourceStoryId === 'storyless' ? 'storyless' : sourceStoryId,
        status_id: sourceStatusId,
        status: sourceCol?.status_name || sourceTask.status,
        status_color: sourceCol?.color || sourceTask.status_color,
      };

      if (sourceStoryId === 'storyless' || targetStoryId === 'storyless') {
        setLocalStorylessTasks(prev => {
          const filtered = prev.filter(
            t => String(t.id) !== String(sourceTask.id),
          );
          if (sourceStoryId === 'storyless') {
            filtered.push(restoredTask);
          }
          return filtered;
        });
      }

      setTaskPagination(prev => {
        const next: Record<string, Record<string, ColumnTaskState>> = {};
        for (const [storyId, columns] of Object.entries(prev)) {
          next[storyId] = {};
          for (const [statusId, state] of Object.entries(columns)) {
            const isTargetCol =
              String(storyId) === String(targetStoryId) &&
              String(statusId) === String(targetStatusId);
            next[storyId][statusId] = {
              ...state,
              tasks: state.tasks.filter(
                t => String(t.id) !== String(sourceTask.id),
              ),
              totalCount: isTargetCol
                ? Math.max(0, state.totalCount - 1)
                : state.totalCount,
            };
          }
        }
        if (sourceStoryId !== 'storyless') {
          if (!next[sourceStoryId]) {
            next[sourceStoryId] = {};
          }
          const currentSource = next[sourceStoryId][sourceStatusId] ?? {
            page: 1,
            isLoading: false,
            hasNext: false,
            totalCount: 0,
            tasks: [],
          };
          next[sourceStoryId][sourceStatusId] = {
            ...currentSource,
            totalCount: currentSource.totalCount + 1,
            tasks: [
              ...currentSource.tasks.filter(
                t => String(t.id) !== String(sourceTask.id),
              ),
              restoredTask,
            ],
          };
        }
        return next;
      });

      if (targetStoryId !== 'storyless' || sourceStoryId !== 'storyless') {
        setLocalUserStories(prev =>
          prev.map(story => {
            const isSource = String(story.id) === String(sourceStoryId);
            const isTarget = String(story.id) === String(targetStoryId);
            if (!isSource && !isTarget) return story;

            return {
              ...story,
              total_tasks:
                sourceStoryId === targetStoryId
                  ? story.total_tasks
                  : isTarget
                    ? Math.max(0, (story.total_tasks ?? 0) - 1)
                    : (story.total_tasks ?? 0) + 1,
              statuses: (story.statuses ?? []).map(column => {
                const wasTarget =
                  isTarget && String(column.status_id) === String(targetStatusId);
                const isSourceColumn =
                  isSource && String(column.status_id) === String(sourceStatusId);
                const tasks = (column.tasks ?? []).filter(
                  task => String(task.id) !== String(sourceTask.id),
                );
                return {
                  ...column,
                  task_count: wasTarget
                    ? Math.max(0, column.task_count - 1)
                    : isSourceColumn &&
                        !(sourceStoryId === targetStoryId && wasTarget)
                      ? column.task_count + 1
                      : column.task_count,
                  tasks: isSourceColumn ? [...tasks, restoredTask] : tasks,
                };
              }),
            };
          }),
        );
      }
    },
    [boardColumns],
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

      const isSourceStoryless =
        sourceStoryId === 'storyless' ||
        !task.user_story_id ||
        task.user_story_id === 'storyless';

      const preferredStoryId = isSourceStoryless ? 'storyless' : sourceStoryId;
      const targetZone = findDropZone(absoluteX, absoluteY, preferredStoryId);

      let targetStatusId = targetZone?.statusId;
      let targetStoryId = targetZone?.storyId;

      if (isSourceStoryless) {
        targetStoryId = 'storyless';
      }

      if (!targetStatusId) {
        const currentX = horizontalScrollOffset.value;
        const xInContent =
          absoluteX - rootOrigin.x + currentX - moderateScale(250);
        if (xInContent >= 0) {
          const colIndex = Math.floor(xInContent / moderateScale(260));
          if (colIndex >= 0 && colIndex < boardColumns.length) {
            targetStatusId = boardColumns[colIndex].status_id;
            if (!targetStoryId) {
              targetStoryId = preferredStoryId;
            }
          }
        }
      }

      if (!targetStatusId || !targetStoryId) return;

      if (
        String(sourceStoryId) === String(targetStoryId) &&
        String(sourceStatusId) === String(targetStatusId)
      ) {
        return;
      }

      const allStories = [storylessStory, ...localUserStories];
      const sourceStory = allStories.find(
        s => String(s.id) === String(sourceStoryId),
      );
      const sourceCol = sourceStory?.statuses?.find(
        c => String(c.status_id) === String(sourceStatusId),
      );
      const sourceTask =
        sourceCol?.tasks?.find(t => String(t.id) === String(task.id)) || task;

      setDropSuccessZone({ storyId: targetStoryId, statusId: targetStatusId });

      // Apply optimistic update immediately in frontend
      applyLocalMove(
        sourceTask,
        sourceStoryId,
        sourceStatusId,
        targetStoryId,
        targetStatusId,
      );

      if (!projectId) {
        setDropSuccessZone(null);
        return;
      }

      const isTargetStoryless = targetStoryId === 'storyless';
      const isChangingStory = String(sourceStoryId) !== String(targetStoryId);

      const payload: UpdateTaskPayload = {
        status_id: targetStatusId,
        ...(isChangingStory
          ? isTargetStoryless
            ? { user_story_id: undefined }
            : { user_story_id: targetStoryId }
          : {}),
      };

      updateTask({
        projectId,
        taskId: String(task.id),
        payload,
      })
        .unwrap()
        .then(() => {
          setTimeout(() => setDropSuccessZone(null), 700);
          if (isSourceStoryless || isTargetStoryless) {
            refetchStorylessTasks();
          }
          refetchBoardStories();
        })
        .catch((error: any) => {
          setDropSuccessZone(null);
          rollbackLocalMove(
            sourceTask,
            sourceStoryId,
            targetStoryId,
            sourceStatusId,
            targetStatusId,
          );
          const errorMsg =
            error?.data?.message || error?.message || 'Failed to move task';
          showSnackbar({
            message: errorMsg,
            type: 'error',
          });
        });
    },
    [
      findDropZone,
      storylessStory,
      localUserStories,
      projectId,
      applyLocalMove,
      rollbackLocalMove,
      updateTask,
      horizontalScrollOffset,
      rootOrigin.x,
      moderateScale,
      boardColumns,
      refetchStorylessTasks,
      refetchBoardStories,
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
      {/* Board Header - Fixed at top, below project tabs */}
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
              Filter {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ''}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Board Container: Horizontal ScrollView wraps fixed column headers & vertically scrollable stories */}
      <Animated.ScrollView
        ref={horizontalScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleHorizontalScroll}
        snapToOffsets={snapOffsets}
        decelerationRate='fast'
        disableIntervalMomentum={true}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
        }}
      >
        {((isBoardStoriesLoading || !hasInitializedStories.current) &&
          localUserStories.length === 0) ||
        ((isStorylessTasksLoading || !hasInitializedStoryless.current) &&
          localStorylessTasks.length === 0) ||
        isSprintSwitchLoading ||
        (isFilterApplying &&
          (isBoardStoriesFetching || isStorylessTasksFetching)) ? (
          <BoardSkeleton columnCount={Math.max(boardColumns.length ?? 0, 3)} />
        ) : (
          <View style={{ flex: 1 }}>
            {/* Fixed Board Header (Column Headers) */}
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
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
                      {boardMeta?.total ?? 0}
                    </AppText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  activeOpacity={0.8}
                  className='items-center justify-center'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    borderRadius: Radius.circle,
                    backgroundColor: colors.primary,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                  }}
                >
                  <Ionicons name='add' size={20} color={colors.white} />
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

            {/* Vertically Scrollable Board Stories Area (Below Board Header) */}
            <Animated.ScrollView
              ref={verticalScrollRef}
              nestedScrollEnabled
              onLayout={event => {
                outerViewportHeightRef.current =
                  event.nativeEvent.layout.height;
                loadStoriesWhenBoardDoesNotScroll();
              }}
              onContentSizeChange={(_width, height) => {
                outerContentHeightRef.current = height;
                loadStoriesWhenBoardDoesNotScroll();
              }}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={handleVerticalScroll}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
              }}
              contentContainerStyle={{
                paddingBottom: isSmallHeight ? hp(20) : hp(12),
              }}
            >
              {displayStories.map(story => (
                <UserStoryBoardRow
                  key={story.id}
                  story={story}
                  projectId={projectId ?? ''}
                  columns={boardColumns}
                  expanded={Boolean(expandedStories[story.id])}
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
                !isStorylessTasksFetching &&
                !isFetchingMore &&
                optimisticStories.length === 0 && (
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

              {isFetchingMore ? (
                <View
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size='small' color={colors.primary} />
                </View>
              ) : hasNextPage ? (
                <TouchableOpacity
                  onPress={loadNextPage}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText
                    variant='caption'
                    style={{ color: colors.primary, fontWeight: '600' }}
                  >
                    Load more stories...
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </Animated.ScrollView>
          </View>
        )}
      </Animated.ScrollView>
      {carouselItems.length > 1 &&
        !isSprintSwitchLoading &&
        !(
          (isBoardStoriesLoading || !hasInitializedStories.current) &&
          localUserStories.length === 0
        ) &&
        !(
          (isStorylessTasksLoading || !hasInitializedStoryless.current) &&
          localStorylessTasks.length === 0
        ) && (
          <View
            pointerEvents='box-none'
            style={{
              position: 'absolute',
              bottom:
                (insets.bottom > 0 ? insets.bottom : moderateScale(8)) +
                moderateScale(10),
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 90,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark
                  ? 'rgba(15, 23, 42, 0.88)'
                  : 'rgba(255, 255, 255, 0.94)',
                borderRadius: Radius.circle,
                paddingHorizontal: moderateScale(10),
                paddingVertical: moderateScale(6),
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                gap: moderateScale(6),
              }}
            >
              {carouselItems.map((item, index) => (
                <CarouselDot
                  key={item.key || index}
                  index={index}
                  color={item.color || colors.primary}
                  snapOffsets={snapOffsets}
                  scrollX={horizontalScrollOffset}
                  onPress={() => scrollToColumn(index)}
                  isDark={isDark}
                  dotInactiveWidth={dotInactiveWidth}
                  dotActiveWidth={dotActiveWidth}
                  colStep={colStep}
                  dotHeight={dotHeight}
                  dotRadius={dotRadius}
                />
              ))}
            </View>
          </View>
        )}
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
        onApplyFilters={(filters, forceRefresh = false) => {
          const filtersChanged =
            JSON.stringify(filters) !== JSON.stringify(selectedFilters);
          if (!filtersChanged && !forceRefresh) return;
          if (isFocused && projectId) {
            setIsFilterApplying(true);
            filterFetchStarted.current = false;
            filterResponseAtStartRef.current = boardStoriesResponse;
          }
          setCurrentPage(1);
          setIsFetchingMore(false);
          hasInitializedStories.current = false;
          setSelectedFilters(filters);
          setBoardRefetchKey(previous => previous + 1);
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
          refetchStorylessTasks();
        }}
      />
    </View>
  );
};

export default ProjectDeatailsScreen;
