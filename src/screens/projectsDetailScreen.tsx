import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

import { UserStory, UserStoryTask } from '../types/project.type';

import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getUserStories } from '../store/project_store/action/project_thunk';
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'projectDetails'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_STORY_WIDTH = 250;
const STATUS_COLUMN_WIDTH = 260;
const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;
const PAGE_SIZE = 20;

// ─── Skeleton components ──────────────────────────────────────────────────────

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

  // Simple pulse via repeated animated style
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Drive the pulse with a shared value loop
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

const BoardSkeletonRow = ({
  columnCount,
}: {
  columnCount: number;
}) => (
  <View
    style={{
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      minHeight: 100,
    }}
  >
    {/* Story cell */}
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

    {/* Status cells */}
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
            <SkeletonBox width="100%" height={56} borderRadius={8} />
            <SkeletonBox width="100%" height={56} borderRadius={8} />
          </>
        )}
      </View>
    ))}
  </View>
);

const BoardSkeleton = ({ columnCount }: { columnCount: number }) => (
  <View>
    {/* Header row */}
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

// ─── TaskDropZone ─────────────────────────────────────────────────────────────

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
      if (width === 0 && height === 0) return; // not yet laid out
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
  }, [storyId, statusId, onRegister, horizontalScrollOffset, verticalScrollOffset]);

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

  // ── Auto-scroll while dragging ──────────────────────────────────────────────
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

  // ── Pan gesture ─────────────────────────────────────────────────────────────
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
      // Compensate card position for any auto-scroll that happened since drag start
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
      // Clear hover highlight regardless of how the gesture ended
      scheduleOnRN(onHoverDropZone, -1, -1);
      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      dragX.value = 0;
      dragY.value = 0;
    });

  // ── Animated style ──────────────────────────────────────────────────────────
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
  activeDropZone,
  dropSuccessZone,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
}: UserStoryBoardRowProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        minHeight: expanded ? 250 : 100,
      }}
    >
      {/* ── User Story label cell ─────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('issue', { projectId, userStoryId: story?.id })
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
            variant="body"
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
            <AppText variant="body" className="font-semibold">
              {story.title}
            </AppText>
            <AppText variant="caption" color="#6B7280">
              {story.tasks?.length ?? 0} tasks · {story.story_points ?? 0} pts
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Status columns ───────────────────────────────────────────────── */}
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
  const route = useRoute<ProjectDetailsRouteProp>();
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  // ── Animated refs & shared values ──────────────────────────────────────────
  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollOffset = useSharedValue(0);
  const verticalScrollOffset = useSharedValue(0);

  // ── Redux ───────────────────────────────────────────────────────────────────
  const {
    project,
    userStories,
    userStoryMeta,
    customStatuses,
    currentSprint,
    loading: storeLoading,
  } = useAppSelector((state: RootState) => state.projects);

  const projectId = project?.id;

  // ── Local state ─────────────────────────────────────────────────────────────
  const [localUserStories, setLocalUserStories] = useState<UserStory[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<{ storyId: string; statusId: string } | null>(null);
  const [dropSuccessZone, setDropSuccessZone] = useState<{ storyId: string; statusId: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isInitialLoad = useRef(true);
  const hasInitializedStories = useRef(false);

  // ── Focus effect: fetch statuses, seed sprint ───────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!projectId) return;
      dispatch(getCustomStatusData({ projectId }));
      if (currentSprint?.id) {
        setSelectedSprintId(currentSprint.id);
      }
    }, [dispatch, projectId, currentSprint?.id]),
  );

  // ── Reset on project / sprint change ────────────────────────────────────────
  useEffect(() => {
    hasInitializedStories.current = false;
    isInitialLoad.current = true;
    setLocalUserStories([]);
    setDropZones([]);
    setActiveDropZone(null);
    setDropSuccessZone(null);
    setCurrentPage(1);
    setExpandedStories({});
  }, [projectId, selectedSprintId]);

  // ── Fetch page 1 (or whenever sprint/project changes) ───────────────────────
  useEffect(() => {
    if (!projectId) return;
    dispatch(
      getUserStories({
        projectId,
        payload: {
          page: 1,
          page_size: PAGE_SIZE,
          ...(selectedSprintId ? { sprint_id: selectedSprintId } : {}),
        },
      }),
    );
  }, [dispatch, projectId, selectedSprintId]);

  // ── Seed / append from Redux into local list ─────────────────────────────────
  useEffect(() => {
    if (!userStories?.length && currentPage === 1) {
      // Empty first page — could be loading or genuinely no data
      if (!storeLoading) {
        setLocalUserStories([]);
        hasInitializedStories.current = true;
        isInitialLoad.current = false;
      }
      return;
    }

    if (!hasInitializedStories.current) {
      // Very first load
      setLocalUserStories(userStories);
      hasInitializedStories.current = true;
      isInitialLoad.current = false;
      setIsFetchingMore(false);
    } else if (currentPage > 1) {
      // Append next page (deduplicate by id)
      setLocalUserStories(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const fresh = userStories.filter(s => !existingIds.has(s.id));
        return [...prev, ...fresh];
      });
      setIsFetchingMore(false);
    }
  }, [userStories, currentPage, storeLoading]);

  // ── Load next page ───────────────────────────────────────────────────────────
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
          ...(selectedSprintId ? { sprint_id: selectedSprintId } : {}),
        },
      }),
    );
  }, [dispatch, projectId, selectedSprintId, currentPage, userStoryMeta, isFetchingMore]);

  // ── Toggle story expansion ──────────────────────────────────────────────────
  const toggleStory = useCallback((storyId: string) => {
    setExpandedStories(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  }, []);

  // ── Drop zone registration ───────────────────────────────────────────────────
  const registerTaskDropZone = useCallback((zone: DropZone) => {
    setDropZones(prev => {
      const index = prev.findIndex(
        item => item.storyId === zone.storyId && item.statusId === zone.statusId,
      );
      if (index === -1) return [...prev, zone];
      const updated = [...prev];
      updated[index] = zone;
      return updated;
    });
  }, []);

  // ── Find drop zone with scroll-compensated coordinates ──────────────────────
  const findDropZone = useCallback(
    (absoluteX: number, absoluteY: number): DropZone | null => {
      const currentX = horizontalScrollOffset.value;
      const currentY = verticalScrollOffset.value;

      return (
        dropZones.find(item => {
          // Adjust stored position by scroll delta since the zone was last measured
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

  // ── Hover highlight ──────────────────────────────────────────────────────────
  const handleHoverDropZone = useCallback(
    (absoluteX: number, absoluteY: number) => {
      if (absoluteX < 0 || absoluteY < 0) {
        setActiveDropZone(null);
        return;
      }
      const zone = findDropZone(absoluteX, absoluteY);
      setActiveDropZone(zone ? { storyId: zone.storyId, statusId: zone.statusId } : null);
    },
    [findDropZone],
  );

  // ── Optimistic local state update ────────────────────────────────────────────
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
          // Same story — only status changes
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

        // Cross-story move
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

  // ── Rollback local state on API error ────────────────────────────────────────
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
            // Restore original task (replace if it slipped in, or add back)
            const already = s.tasks.some(t => t.id === sourceTask.id);
            return {
              ...s,
              tasks: already
                ? s.tasks.map(t => (t.id === sourceTask.id ? sourceTask : t))
                : [...s.tasks, sourceTask],
              total_tasks: sourceStoryId !== targetStoryId
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

  // ── Task drop handler ────────────────────────────────────────────────────────
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

      // No-op: dropped in the same cell
      if (sourceStoryId === targetStoryId && sourceStatusId === targetStatusId) return;

      // Snapshot source task for rollback
      const sourceStory = localUserStories.find(s => s.id === sourceStoryId);
      const sourceTask = sourceStory?.tasks?.find(t => t.id === task.id);
      if (!sourceTask) return;

      // 1. Show success highlight immediately
      setDropSuccessZone({ storyId: targetStoryId, statusId: targetStatusId });

      // 2. Optimistically update local state
      applyLocalMove(task.id, sourceStoryId, targetStoryId, targetStatusId);

      if (!projectId) {
        setDropSuccessZone(null);
        return;
      }

      // 3. Persist to API
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
          onFinally: () => {
            // nothing extra needed
          },
        }),
      );
    },
    [dispatch, findDropZone, localUserStories, projectId, applyLocalMove, rollbackLocalMove],
  );

  // ── Derived: is initial board loading? ──────────────────────────────────────
  const isInitialLoading =
    storeLoading && isInitialLoad.current && localUserStories.length === 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.surface, paddingTop: moderateScale(20) }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.tightGap,
          paddingBottom: moderateScale(12),
        }}
      >
        <AppText variant="title" className="font-bold">
          Kanban Board
        </AppText>
        <AppText
          variant="body"
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
        onScrollEndDrag={() => {
          // Re-measure all drop zones after the user settles the scroll
          // so coordinates are fresh before the next drag
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
            /* ── Skeleton board ──────────────────────────────────────────── */
            <BoardSkeleton columnCount={Math.max(customStatuses?.length ?? 0, 3)} />
          ) : (
            <View>
              {/* ── Column header row ─────────────────────────────────────── */}
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderBottomColor: '#D1D5DB',
                }}
              >
                <View style={{ width: USER_STORY_WIDTH, padding: 12 }}>
                  <AppText variant="body" className="font-bold">
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
                      <AppText variant="body" className="font-bold">
                        {status.name}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── Board rows ────────────────────────────────────────────── */}
              {localUserStories.map(story => (
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
                  activeDropZone={activeDropZone}
                  dropSuccessZone={dropSuccessZone}
                  horizontalScrollRef={horizontalScrollRef}
                  verticalScrollRef={verticalScrollRef}
                  horizontalScrollOffset={horizontalScrollOffset}
                  verticalScrollOffset={verticalScrollOffset}
                />
              ))}

              {/* ── Empty state ───────────────────────────────────────────── */}
              {!storeLoading && localUserStories.length === 0 && (
                <View
                  style={{
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                  }}
                >
                  <AppText variant="body" color="#9CA3AF">
                    No user stories found for this sprint.
                  </AppText>
                </View>
              )}

              {/* ── Pagination footer ─────────────────────────────────────── */}
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
                      <ActivityIndicator size="small" color="#6366F1" />
                      <AppText
                        variant="caption"
                        color="#6B7280"
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
                      <AppText variant="body" color="#374151">
                        Load more stories (
                        {(userStoryMeta?.total_items ?? 0) - localUserStories.length} remaining)
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
