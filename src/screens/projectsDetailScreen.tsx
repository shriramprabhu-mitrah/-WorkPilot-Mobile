import React, {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  startTransition,
} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { UserStory, UserStoryTask } from '../types/project.type';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getUserStories } from '../store/project_store/action/project_thunk';
import {
  favouriteTaskThunk,
  unfavouriteTaskThunk,
  favouriteUserStoryThunk,
  unfavouriteUserStoryThunk,
} from '../store/project_store/action/projectBoard.thunk';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedRef,
  scrollTo,
  AnimatedRef,
  SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { getCustomStatusData } from '../store/customStatus_store/action/customstatus.thunk';
import { CustomStatus } from '../types/customstatus.type';
import { updateTaskThunk } from '../store/task_store/action/task.thunk';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type DropZone = {
  storyId: string;
  statusId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scrollXAtMeasure: number;
  scrollYAtMeasure: number;
};

const USER_STORY_WIDTH = 250;
const STATUS_COLUMN_WIDTH = 260;
const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;
const PAGE_SIZE = 20;

const SkeletonBox = ({
  width,
  height,
  borderRadius = 4,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) => {
  const opacity = useSharedValue(0.4);
  useAnimatedReaction(
    () => opacity.value,
    () => {},
  );

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    let ascending = true;
    const interval = setInterval(() => {
      if (ascending) {
        opacity.value = opacity.value < 0.85 ? opacity.value + 0.07 : 0.85;
        if (opacity.value >= 0.85) ascending = false;
      } else {
        opacity.value = opacity.value > 0.3 ? opacity.value - 0.07 : 0.3;
        if (opacity.value <= 0.3) ascending = true;
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
        },
        animStyle,
        style,
      ]}
    />
  );
};

const BoardSkeletonRow = ({ columnCount }: { columnCount: number }) => (
  <View
    style={{
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      minHeight: 100,
    }}
  >
    <View
      style={{
        width: USER_STORY_WIDTH,
        padding: 12,
        backgroundColor: '#F9FAFB',
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <SkeletonBox width={12} height={12} borderRadius={6} />
        <SkeletonBox width={140} height={14} />
      </View>
      <SkeletonBox width={80} height={10} />
    </View>

    {Array.from({ length: columnCount }).map((_, i) => (
      <View
        key={i}
        style={{
          width: STATUS_COLUMN_WIDTH,
          minHeight: 100,
          padding: 8,
          borderLeftWidth: 1,
          borderLeftColor: '#E5E7EB',
          gap: 8,
        }}
      >
        {i === 0 && (
          <>
            <SkeletonBox width='100%' height={56} borderRadius={8} />
            <SkeletonBox width='100%' height={56} borderRadius={8} />
          </>
        )}
      </View>
    ))}
  </View>
);

const BoardSkeleton = ({ columnCount }: { columnCount: number }) => (
  <View>
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
      }}
    >
      <View style={{ width: USER_STORY_WIDTH, padding: 12 }}>
        <SkeletonBox width={100} height={14} />
      </View>
      {Array.from({ length: columnCount }).map((_, i) => (
        <View
          key={i}
          style={{
            width: STATUS_COLUMN_WIDTH,
            padding: 12,
            borderLeftWidth: 1,
            borderLeftColor: '#E5E7EB',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SkeletonBox width={10} height={10} borderRadius={5} />
            <SkeletonBox width={80} height={14} />
          </View>
        </View>
      ))}
    </View>
    {Array.from({ length: 5 }).map((_, i) => (
      <BoardSkeletonRow key={i} columnCount={columnCount} />
    ))}
  </View>
);

type TaskDropZoneProps = {
  storyId: string;
  statusId: string;
  onRegister: (zone: DropZone) => void;
  isActive?: boolean;
  isSuccess?: boolean;
  children?: React.ReactNode;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
};

const TaskDropZone = ({
  storyId,
  statusId,
  onRegister,
  isActive,
  isSuccess,
  children,
  horizontalScrollOffset,
  verticalScrollOffset,
}: TaskDropZoneProps) => {
  const dropZoneRef = useRef<View>(null);

  const measureZone = useCallback(() => {
    if (!dropZoneRef.current) return;
    dropZoneRef.current.measureInWindow((x, y, width, height) => {
      if (width === 0 && height === 0) return;
      onRegister({
        storyId,
        statusId,
        x,
        y,
        width,
        height,
        scrollXAtMeasure: horizontalScrollOffset?.value ?? 0,
        scrollYAtMeasure: verticalScrollOffset?.value ?? 0,
      });
    });
  }, [
    storyId,
    statusId,
    onRegister,
    horizontalScrollOffset,
    verticalScrollOffset,
  ]);

  return (
    <View
      ref={dropZoneRef}
      onLayout={measureZone}
      style={{
        width: STATUS_COLUMN_WIDTH,
        minHeight: 100,
        padding: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E7EB',
        backgroundColor: isSuccess
          ? '#D1FAE5'
          : isActive
            ? '#E0E7FF'
            : 'transparent',
      }}
    >
      {children}
    </View>
  );
};

// ─── DraggableTask ────────────────────────────────────────────────────────────

type DraggableTaskProps = {
  task: UserStoryTask;
  sourceStoryId: string;
  sourceStatusId: string;
  projectId: string;
  onDrop: (
    task: UserStoryTask,
    sourceStoryId: string,
    sourceStatusId: string,
    absoluteX: number,
    absoluteY: number,
  ) => void;
  onHoverDropZone: (absoluteX: number, absoluteY: number) => void;
  onToggleTaskFavorite?: (storyId: string, taskId: string) => void;
  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
};

const DraggableTask = ({
  task,
  sourceStoryId,
  sourceStatusId,
  projectId,
  onDrop,
  onHoverDropZone,
  onToggleTaskFavorite,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
}: DraggableTaskProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const startScrollX = useSharedValue(0);
  const startScrollY = useSharedValue(0);

  useAnimatedReaction(
    () => ({ x: dragX.value, y: dragY.value, dragging: isDragging.value }),
    current => {
      if (!current.dragging) return;

      const curX = horizontalScrollOffset?.value ?? 0;
      const curY = verticalScrollOffset?.value ?? 0;

      if (current.x > 350) {
        const next = curX + SCROLL_SPEED;
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      } else if (current.x < EDGE_THRESHOLD) {
        const next = Math.max(0, curX - SCROLL_SPEED);
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      }

      if (current.y > 700) {
        const next = curY + SCROLL_SPEED;
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      } else if (current.y < EDGE_THRESHOLD) {
        const next = Math.max(0, curY - SCROLL_SPEED);
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      }
    },
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(event => {
      isDragging.value = true;
      startScrollX.value = horizontalScrollOffset.value;
      startScrollY.value = verticalScrollOffset.value;
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })
    .onUpdate(event => {
      const scrollDiffX = horizontalScrollOffset.value - startScrollX.value;
      const scrollDiffY = verticalScrollOffset.value - startScrollY.value;
      translateX.value = event.translationX + scrollDiffX;
      translateY.value = event.translationY + scrollDiffY;
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })
    .onEnd(event => {
      scheduleOnRN(
        onDrop,
        task,
        sourceStoryId,
        sourceStatusId,
        event.absoluteX,
        event.absoluteY,
      );
      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      dragX.value = 0;
      dragY.value = 0;
    })
    .onFinalize(() => {
      scheduleOnRN(onHoverDropZone, -1, -1);
      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      dragX.value = 0;
      dragY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? 1.04 : 1 },
    ],
    zIndex: isDragging.value ? 9999 : 1,
    elevation: isDragging.value ? 10 : 0,
    shadowColor: isDragging.value ? '#000' : 'transparent',
    shadowOffset: { width: 0, height: isDragging.value ? 4 : 0 },
    shadowOpacity: isDragging.value ? 0.2 : 0,
    shadowRadius: isDragging.value ? 8 : 0,
  }));

  return (
    <View style={{ position: 'relative' }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <TaskCard
            item={{
              id: task.id,
              title: task.title,
              priority: task.priority,
              points: `${task.story_points ?? 0}p`,
              avatar: task.assignee_name?.charAt(0)?.toUpperCase() || '?',
              avatarColor: '#6366F1',
            }}
            projectId={projectId}
          />
        </Animated.View>
      </GestureDetector>
      <TouchableOpacity
        onPress={() => onToggleTaskFavorite?.(sourceStoryId, task.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 10000,
          padding: 2,
        }}
      >
        <AppText
          style={{
            color: task.is_favourite ? '#F59E0B' : '#9CA3AF',
            fontSize: 20,
          }}
        >
          {task.is_favourite ? '★' : '☆'}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

// ─── UserStoryBoardRow ────────────────────────────────────────────────────────

type UserStoryBoardRowProps = {
  story: UserStory;
  projectId: string;
  customStatuses: CustomStatus[];
  expanded: boolean;
  onToggle: () => void;
  onRegisterDropZone: (zone: DropZone) => void;
  onTaskDrop: (
    task: UserStoryTask,
    sourceStoryId: string,
    sourceStatusId: string,
    absoluteX: number,
    absoluteY: number,
  ) => void;
  onHoverDropZone: (absoluteX: number, absoluteY: number) => void;
  onToggleStoryFavorite?: (storyId: string) => void;
  onToggleTaskFavorite?: (storyId: string, taskId: string) => void;
  activeDropZone: { storyId: string; statusId: string } | null;
  dropSuccessZone: { storyId: string; statusId: string } | null;
  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
};

const UserStoryBoardRow = ({
  story,
  projectId,
  customStatuses,
  expanded,
  onToggle,
  onRegisterDropZone,
  onTaskDrop,
  onHoverDropZone,
  onToggleStoryFavorite,
  onToggleTaskFavorite,
  activeDropZone,
  dropSuccessZone,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
}: UserStoryBoardRowProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  console.log('LINE484', story);
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        minHeight: expanded ? 250 : 100,
      }}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('issue', {
            projectId,
            userStoryId: story?.id,
            story: story,
          })
        }
        activeOpacity={0.7}
        style={{
          width: USER_STORY_WIDTH,
          padding: 12,
          backgroundColor: '#F9FAFB',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <AppText
            variant='body'
            style={{ marginRight: 8 }}
            onPress={e => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {expanded ? '▼' : '▶'}
          </AppText>

          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: story.status_color ?? '#9CA3AF',
              marginTop: 5,
              marginRight: 8,
            }}
          />

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <AppText
                variant='body'
                className='font-semibold'
                style={{ flex: 1 }}
              >
                {story.title}
              </AppText>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  onToggleStoryFavorite?.(story.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 4 }}
              >
                <AppText
                  style={{
                    color: story.is_favourite ? '#F59E0B' : '#9CA3AF',
                    fontSize: 20,
                  }}
                >
                  {story.is_favourite ? '★' : '☆'}
                </AppText>
              </TouchableOpacity>
            </View>
            <AppText variant='caption' color='#6B7280'>
              {story.tasks?.length ?? 0} tasks · {story.story_points ?? 0} pts
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      {customStatuses?.map(status => {
        const tasks =
          story.tasks?.filter(task => task.status_id === status.id) ?? [];

        const isActive =
          activeDropZone?.storyId === story.id &&
          activeDropZone?.statusId === status.id;

        const isSuccess =
          dropSuccessZone?.storyId === story.id &&
          dropSuccessZone?.statusId === status.id;

        return (
          <TaskDropZone
            key={`${story.id}-${status.id}`}
            storyId={story.id}
            statusId={status.id}
            onRegister={onRegisterDropZone}
            isActive={isActive}
            isSuccess={isSuccess}
            horizontalScrollOffset={horizontalScrollOffset}
            verticalScrollOffset={verticalScrollOffset}
          >
            {expanded &&
              tasks.map(task => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  sourceStoryId={story.id}
                  sourceStatusId={status.id}
                  projectId={projectId}
                  onDrop={onTaskDrop}
                  onHoverDropZone={onHoverDropZone}
                  onToggleTaskFavorite={onToggleTaskFavorite}
                  horizontalScrollRef={horizontalScrollRef}
                  verticalScrollRef={verticalScrollRef}
                  horizontalScrollOffset={horizontalScrollOffset}
                  verticalScrollOffset={verticalScrollOffset}
                />
              ))}
          </TaskDropZone>
        );
      })}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ProjectDeatailsScreen = () => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollOffset = useSharedValue(0);
  const verticalScrollOffset = useSharedValue(0);

  // Redux Selectors
  const {
    project,
    currentSprint,
    userStories,
    userStoryMeta,
    customStatuses,
    loading: storeLoading,
  } = useAppSelector((state: RootState) => state.projects);

  console.log('userStories', userStories);

  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  const currentSprintId =
    currentSprint?.id?.toString() || (currentSprint as any)?._id?.toString();

  // Local State
  const [localUserStories, setLocalUserStories] = useState<UserStory[]>([]);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isInitialLoad = useRef(true);
  const hasInitializedStories = useRef(false);

  // Helper – stories already carry is_favourite from the API, just pass through
  const mapStoriesFromApi = useCallback(
    (stories: UserStory[]) => stories.map(s => ({ ...s })),
    [],
  );

  type OptimisticAction =
    | { kind: 'story'; storyId: string; isFav: boolean }
    | { kind: 'task'; taskId: string; isFav: boolean };

  const [optimisticStories, addOptimisticUpdate] = useOptimistic<
    UserStory[],
    OptimisticAction
  >(localUserStories, (current, action) => {
    if (action.kind === 'story') {
      return current.map(s =>
        s.id === action.storyId ? { ...s, is_favourite: action.isFav } : s,
      );
    }
    return current.map(s => ({
      ...s,
      tasks: s.tasks?.map(t =>
        t.id === action.taskId ? { ...t, is_favourite: action.isFav } : t,
      ),
    }));
  });

  // Updated useFocusEffect to dispatch getCustomStatusData and getUserStories on focus
  useFocusEffect(
    useCallback(() => {
      if (!projectId || !currentSprintId) return;

      dispatch(getCustomStatusData({ projectId }));

      dispatch(
        getUserStories({
          projectId,
          payload: {
            page: 1,
            page_size: PAGE_SIZE,
            sprint_id: currentSprintId,
          },
        }),
      );
    }, [dispatch, projectId, currentSprintId]),
  );

  useEffect(() => {
    hasInitializedStories.current = false;
    isInitialLoad.current = true;
    setLocalUserStories([]);
    setDropZones([]);
    setActiveDropZone(null);
    setDropSuccessZone(null);
    setCurrentPage(1);
    setExpandedStories({});
  }, [projectId, currentSprintId]);

  // Seed / append from Redux into local list – is_favourite comes from the API
  useEffect(() => {
    if (!userStories?.length && currentPage === 1) {
      if (!storeLoading) {
        setLocalUserStories([]);
        hasInitializedStories.current = true;
        isInitialLoad.current = false;
      }
      return;
    }

    if (!hasInitializedStories.current) {
      setLocalUserStories(mapStoriesFromApi(userStories));
      hasInitializedStories.current = true;
      isInitialLoad.current = false;
      setIsFetchingMore(false);
    } else if (currentPage > 1) {
      setLocalUserStories(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const fresh = userStories.filter(
          (s: UserStory) => !existingIds.has(s.id),
        );
        return [...prev, ...mapStoriesFromApi(fresh)];
      });
      setIsFetchingMore(false);
    } else {
      setLocalUserStories(mapStoriesFromApi(userStories));
    }
  }, [userStories, currentPage, storeLoading, mapStoriesFromApi]);

  const loadNextPage = useCallback(() => {
    if (!projectId) return;
    if (!userStoryMeta?.has_next) return;
    if (isFetchingMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setIsFetchingMore(true);

    dispatch(
      getUserStories({
        projectId,
        payload: {
          page: nextPage,
          page_size: PAGE_SIZE,
          ...(currentSprintId ? { sprint_id: currentSprintId } : {}),
        },
      }),
    );
  }, [
    dispatch,
    projectId,
    currentSprintId,
    currentPage,
    userStoryMeta,
    isFetchingMore,
  ]);

  const toggleStory = useCallback((storyId: string) => {
    setExpandedStories(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  }, []);

  const refetchUserStories = useCallback(() => {
    if (!projectId) return Promise.resolve();
    return dispatch(
      getUserStories({
        projectId,
        payload: {
          page: 1,
          page_size: PAGE_SIZE,
          ...(currentSprintId ? { sprint_id: currentSprintId } : {}),
        },
      }),
    );
  }, [dispatch, projectId, currentSprintId]);

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
            );
          } else {
            await dispatch(
              favouriteUserStoryThunk({ projectId, userStoryId: storyId }),
            );
          }

          setLocalUserStories(prev =>
            prev.map(s =>
              s.id === storyId ? { ...s, is_favourite: !currentFav } : s,
            ),
          );

          await refetchUserStories();
        } catch {}
      });
    },
    [
      dispatch,
      projectId,
      optimisticStories,
      addOptimisticUpdate,
      refetchUserStories,
    ],
  );

  const handleToggleTaskFavorite = useCallback(
    (_storyId: string, taskId: string) => {
      if (!projectId) return;
      const task = optimisticStories
        .flatMap(s => s.tasks ?? [])
        .find(t => t.id === taskId);
      const currentFav = task?.is_favourite ?? false;

      startTransition(async () => {
        addOptimisticUpdate({ kind: 'task', taskId, isFav: !currentFav });

        try {
          if (currentFav) {
            await dispatch(unfavouriteTaskThunk({ projectId, taskId }));
          } else {
            await dispatch(favouriteTaskThunk({ projectId, taskId }));
          }

          setLocalUserStories(prev =>
            prev.map(s => ({
              ...s,
              tasks: s.tasks?.map(t =>
                t.id === taskId ? { ...t, is_favourite: !currentFav } : t,
              ),
            })),
          );

          await refetchUserStories();
        } catch {}
      });
    },
    [
      dispatch,
      projectId,
      optimisticStories,
      addOptimisticUpdate,
      refetchUserStories,
    ],
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
        setActiveDropZone(null);
        return;
      }
      const zone = findDropZone(absoluteX, absoluteY);
      setActiveDropZone(
        zone ? { storyId: zone.storyId, statusId: zone.statusId } : null,
      );
    },
    [findDropZone],
  );

  const applyLocalMove = useCallback(
    (
      taskId: string,
      sourceStoryId: string,
      targetStoryId: string,
      targetStatusId: string,
    ) => {
      setLocalUserStories(prev => {
        const sourceStory = prev.find(s => s.id === sourceStoryId);
        const movedTask = sourceStory?.tasks?.find(t => t.id === taskId);
        if (!movedTask) return prev;

        if (sourceStoryId === targetStoryId) {
          return prev.map(s =>
            s.id !== sourceStoryId
              ? s
              : {
                  ...s,
                  tasks: s.tasks.map(t =>
                    t.id === taskId ? { ...t, status_id: targetStatusId } : t,
                  ),
                },
          );
        }

        return prev.map(s => {
          if (s.id === sourceStoryId) {
            return {
              ...s,
              tasks: s.tasks.filter(t => t.id !== taskId),
              total_tasks: Math.max(0, (s.total_tasks ?? 0) - 1),
            };
          }
          if (s.id === targetStoryId) {
            return {
              ...s,
              tasks: [...s.tasks, { ...movedTask, status_id: targetStatusId }],
              total_tasks: (s.total_tasks ?? 0) + 1,
            };
          }
          return s;
        });
      });
    },
    [],
  );

  const rollbackLocalMove = useCallback(
    (
      sourceTask: UserStoryTask,
      sourceStoryId: string,
      targetStoryId: string,
    ) => {
      setLocalUserStories(prev => {
        return prev.map(s => {
          if (s.id === targetStoryId && sourceStoryId !== targetStoryId) {
            return {
              ...s,
              tasks: s.tasks.filter(t => t.id !== sourceTask.id),
              total_tasks: Math.max(0, (s.total_tasks ?? 0) - 1),
            };
          }
          if (s.id === sourceStoryId) {
            const already = s.tasks.some(t => t.id === sourceTask.id);
            return {
              ...s,
              tasks: already
                ? s.tasks.map(t => (t.id === sourceTask.id ? sourceTask : t))
                : [...s.tasks, sourceTask],
              total_tasks:
                sourceStoryId !== targetStoryId
                  ? (s.total_tasks ?? 0) + 1
                  : s.total_tasks,
            };
          }
          return s;
        });
      });
    },
    [],
  );

  const handleTaskDrop = useCallback(
    (
      task: UserStoryTask,
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
      const sourceTask = sourceStory?.tasks?.find(t => t.id === task.id);
      if (!sourceTask) return;

      setDropSuccessZone({ storyId: targetStoryId, statusId: targetStatusId });
      applyLocalMove(task.id, sourceStoryId, targetStoryId, targetStatusId);

      if (!projectId) {
        setDropSuccessZone(null);
        return;
      }

      dispatch(
        updateTaskThunk({
          projectId,
          taskId: task.id,
          payload: {
            user_story_id: targetStoryId,
            status_id: targetStatusId,
          },
          onSuccess: () => {
            setTimeout(() => setDropSuccessZone(null), 700);
          },
          onError: () => {
            setDropSuccessZone(null);
            rollbackLocalMove(sourceTask, sourceStoryId, targetStoryId);
          },
          onFinally: () => {},
        }),
      );
    },
    [
      dispatch,
      findDropZone,
      localUserStories,
      projectId,
      applyLocalMove,
      rollbackLocalMove,
    ],
  );

  const isInitialLoading =
    storeLoading && isInitialLoad.current && localUserStories.length === 0;

  return (
    <ScrollView
      className='flex-1'
      style={{ backgroundColor: colors.surface, paddingTop: moderateScale(20) }}
    >
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.tightGap,
          paddingBottom: moderateScale(12),
        }}
      >
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

      <Animated.ScrollView
        ref={verticalScrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event => {
          verticalScrollOffset.value = event.nativeEvent.contentOffset.y;
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        <Animated.ScrollView
          ref={horizontalScrollRef}
          horizontal
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
          {isInitialLoading ? (
            <BoardSkeleton
              columnCount={Math.max(customStatuses?.length ?? 0, 3)}
            />
          ) : (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderBottomColor: '#D1D5DB',
                }}
              >
                <View style={{ width: USER_STORY_WIDTH, padding: 12 }}>
                  <AppText variant='body' className='font-bold'>
                    User Stories
                  </AppText>
                </View>
                {customStatuses?.map(status => (
                  <View
                    key={status.id}
                    style={{
                      width: STATUS_COLUMN_WIDTH,
                      padding: 12,
                      borderLeftWidth: 1,
                      borderLeftColor: '#E5E7EB',
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
                        {status.name}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>

              {optimisticStories.map(story => (
                <UserStoryBoardRow
                  key={story.id}
                  story={story}
                  projectId={projectId ?? ''}
                  customStatuses={customStatuses}
                  expanded={!!expandedStories[story.id]}
                  onToggle={() => toggleStory(story.id)}
                  onRegisterDropZone={registerTaskDropZone}
                  onTaskDrop={handleTaskDrop}
                  onHoverDropZone={handleHoverDropZone}
                  onToggleStoryFavorite={handleToggleStoryFavorite}
                  onToggleTaskFavorite={handleToggleTaskFavorite}
                  activeDropZone={activeDropZone}
                  dropSuccessZone={dropSuccessZone}
                  horizontalScrollRef={horizontalScrollRef}
                  verticalScrollRef={verticalScrollRef}
                  horizontalScrollOffset={horizontalScrollOffset}
                  verticalScrollOffset={verticalScrollOffset}
                />
              ))}

              {!storeLoading && localUserStories.length === 0 && (
                <View
                  style={{
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                  }}
                >
                  <AppText variant='body' color='#9CA3AF'>
                    No user stories found for this sprint.
                  </AppText>
                </View>
              )}

              {userStoryMeta?.has_next && (
                <View style={{ alignItems: 'flex-start', paddingVertical: 16 }}>
                  {isFetchingMore ? (
                    <View
                      style={{
                        width: USER_STORY_WIDTH + STATUS_COLUMN_WIDTH,
                        alignItems: 'center',
                        paddingVertical: 12,
                      }}
                    >
                      <ActivityIndicator size='small' color='#6366F1' />
                      <AppText
                        variant='caption'
                        color='#6B7280'
                        style={{ marginTop: 6 }}
                      >
                        Loading more stories…
                      </AppText>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={loadNextPage}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        marginLeft: 12,
                      }}
                    >
                      <AppText variant='body' color='#374151'>
                        Load more stories (
                        {(userStoryMeta?.total_items ?? 0) -
                          localUserStories.length}{' '}
                        remaining)
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </Animated.ScrollView>
    </ScrollView>
  );
};

export default ProjectDeatailsScreen;
