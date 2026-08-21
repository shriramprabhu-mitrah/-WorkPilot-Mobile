import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

import { BoardUserStory, Task } from '../data/projectDetailScreenData';

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

type UserStoryBoardRowProps = {
  story: BoardUserStory;
  projectId: string;
  customStatuses: CustomStatus[];
  expanded: boolean;

  onToggle: () => void;

  onRegisterDropZone: (storyId: string, statusId: string, ref: View) => void;

  onTaskDrop: (
    task: Task,
    sourceStoryId: string,
    sourceStatusId: string,
    absoluteX: number,
    absoluteY: number,
  ) => void;

  onHoverDropZone: (absoluteX: number, absoluteY: number) => void;

  activeDropZone: {
    storyId: string;
    statusId: string;
  } | null;

  dropSuccessZone: {
    storyId: string;
    statusId: string;
  } | null;

  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;

  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
};

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

type DraggableTaskProps = {
  task: Task;

  sourceStoryId: string;
  sourceStatusId: string;

  projectId: string;

  onDrop: (
    task: Task,
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

const USER_STORY_WIDTH = 250;
const STATUS_COLUMN_WIDTH = 260;

const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;

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
      {/* USER STORY */}

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <AppText
            variant='body'
            style={{
              marginRight: 8,
            }}
            onPress={onToggle}
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
            <AppText variant='body' className='font-semibold'>
              {story.title}
            </AppText>

            <AppText variant='caption' color='#6B7280'>
              {story.tasks?.length ?? 0} tasks · {story.story_points ?? 0} pts
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      {/* STATUS COLUMNS */}

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

  /**
   * =========================================
   * AUTO SCROLL
   * =========================================
   */

  // Inside DraggableTask:
  useAnimatedReaction(
    () => ({
      x: dragX.value,
      y: dragY.value,
      dragging: isDragging.value,
    }),
    current => {
      if (!current.dragging) return;

      const currentXOffset = horizontalScrollOffset?.value ?? 0;
      const currentYOffset = verticalScrollOffset?.value ?? 0;

      // Horizontal auto scroll
      if (current.x > 350) {
        const nextX = currentXOffset + SCROLL_SPEED;
        horizontalScrollOffset.value = nextX;
        scrollTo(horizontalScrollRef, nextX, 0, false);
      } else if (current.x < EDGE_THRESHOLD) {
        const nextX = Math.max(0, currentXOffset - SCROLL_SPEED);
        horizontalScrollOffset.value = nextX;
        scrollTo(horizontalScrollRef, nextX, 0, false);
      }

      // Vertical auto scroll
      if (current.y > 700) {
        const nextY = currentYOffset + SCROLL_SPEED;
        verticalScrollOffset.value = nextY;
        scrollTo(verticalScrollRef, 0, nextY, false);
      } else if (current.y < EDGE_THRESHOLD) {
        const nextY = Math.max(0, currentYOffset - SCROLL_SPEED);
        verticalScrollOffset.value = nextY;
        scrollTo(verticalScrollRef, 0, nextY, false);
      }
    },
  );

  /**
   * =========================================
   * DRAG GESTURE
   * =========================================
   */

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(150)

    .onStart(event => {
      isDragging.value = true;

      // Save scroll position when drag starts
      startScrollX.value = horizontalScrollOffset.value;

      startScrollY.value = verticalScrollOffset.value;

      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;

      // Immediately detect current cell
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })

    .onUpdate(event => {
      /**
       * Difference caused by auto-scroll.
       */
      const scrollDiffX = horizontalScrollOffset.value - startScrollX.value;

      const scrollDiffY = verticalScrollOffset.value - startScrollY.value;

      /**
       * Move dragged card.
       */
      translateX.value = event.translationX + scrollDiffX;

      translateY.value = event.translationY + scrollDiffY;

      /**
       * Current absolute finger position.
       */
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;

      /**
       * Update highlighted drop zone.
       */
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })

    .onEnd(event => {
      /**
       * Send final absolute position.
       */
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
      /**
       * Remove hover indication.
       */
      scheduleOnRN(onHoverDropZone, -1, -1);

      translateX.value = 0;
      translateY.value = 0;

      isDragging.value = false;

      dragX.value = 0;
      dragY.value = 0;
    });

  /**
   * =========================================
   * DRAGGED CARD STYLE
   * =========================================
   */

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
        {
          scale: isDragging.value ? 1.03 : 1,
        },
      ],

      zIndex: isDragging.value ? 9999 : 1,

      elevation: isDragging.value ? 10 : 0,
    };
  });

  /**
   * =========================================
   * RENDER
   * =========================================
   */

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

// Main Screen Component
const ProjectDeatailsScreen = () => {
  const dispatch = useAppDispatch();

  const route = useRoute<ProjectDetailsRouteProp>();

  const { colors } = useTheme();

  const hasInitializedStories = useRef(false);

  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  // ============================================================
  // SCROLL REFS
  // ============================================================

  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();

  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();

  const horizontalScrollOffset = useSharedValue(0);

  const verticalScrollOffset = useSharedValue(0);

  // ============================================================
  // REDUX
  // ============================================================

  const {
    project,
    userStories,
    customStatuses,
    currentSprint,
    getCurrentSprintLoading,
  } = useAppSelector((state: RootState) => state.projects);

  const projectId = project?.id;

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [localUserStories, setLocalUserStories] = useState<BoardUserStory[]>(
    [],
  );

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});

  /**
   * Measured drop zones.
   *
   * Every cell is:
   * User Story + Status
   */
  const [dropZones, setDropZones] = useState<DropZone[]>([]);

  /**
   * Cell currently under the dragged task.
   */
  const [activeDropZone, setActiveDropZone] = useState<{
    storyId: string;
    statusId: string;
  } | null>(null);

  /**
   * Cell where task was successfully dropped.
   */
  const [dropSuccessZone, setDropSuccessZone] = useState<{
    storyId: string;
    statusId: string;
  } | null>(null);

  // ============================================================
  // LOAD CUSTOM STATUSES + INITIAL SPRINT
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      if (!projectId) {
        return;
      }

      dispatch(
        getCustomStatusData({
          projectId,
        }),
      );

      if (currentSprint?.id) {
        setSelectedSprintId(currentSprint.id);
      }
    }, [dispatch, projectId, currentSprint?.id]),
  );

  // ============================================================
  // LOAD USER STORIES
  // ============================================================

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const payload: {
      page: number;
      page_size: number;
      sprint_id?: string;
    } = {
      page: 1,
      page_size: 100,
    };

    if (selectedSprintId) {
      payload.sprint_id = selectedSprintId;
    }

    dispatch(
      getUserStories({
        projectId,
        payload,
      }),
    );
  }, [dispatch, projectId, selectedSprintId]);

  // ============================================================
  // RESET LOCAL BOARD WHEN PROJECT / SPRINT CHANGES
  // ============================================================

  useEffect(() => {
    hasInitializedStories.current = false;

    setLocalUserStories([]);
    setDropZones([]);
    setActiveDropZone(null);
    setDropSuccessZone(null);
  }, [projectId, selectedSprintId]);

  // ============================================================
  // COPY REDUX STORIES TO LOCAL STATE
  // ============================================================

  useEffect(() => {
    if (!userStories?.length) {
      return;
    }

    if (!hasInitializedStories.current) {
      setLocalUserStories(userStories);
      hasInitializedStories.current = true;
    }
  }, [userStories]);

  // ============================================================
  // EXPAND / COLLAPSE STORY
  // ============================================================

  const toggleStory = useCallback((storyId: string) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  }, []);

  // ============================================================
  // REGISTER DROP ZONE
  // ============================================================

  const registerTaskDropZone = useCallback((zone: DropZone) => {
    setDropZones(prev => {
      const index = prev.findIndex(
        item =>
          item.storyId === zone.storyId && item.statusId === zone.statusId,
      );

      if (index === -1) {
        return [...prev, zone];
      }

      const updated = [...prev];

      updated[index] = zone;

      return updated;
    });
  }, []);
  // ============================================================
  // FIND DROP ZONE
  // ============================================================

  const findDropZone = useCallback(
    (absoluteX: number, absoluteY: number): DropZone | null => {
      const currentX = horizontalScrollOffset.value;
      const currentY = verticalScrollOffset.value;

      const zone = dropZones.find(item => {
        const adjustedX = item.x - (currentX - item.scrollXAtMeasure);
        const adjustedY = item.y - (currentY - item.scrollYAtMeasure);

        const insideX =
          absoluteX >= adjustedX && absoluteX <= adjustedX + item.width;
        const insideY =
          absoluteY >= adjustedY && absoluteY <= adjustedY + item.height;

        return insideX && insideY;
      });

      return zone ?? null;
    },
    [dropZones, horizontalScrollOffset, verticalScrollOffset],
  );

  // ============================================================
  // HOVER DROP ZONE
  // ============================================================

  const handleHoverDropZone = useCallback(
    (absoluteX: number, absoluteY: number) => {
      /**
       * Invalid coordinates means drag ended.
       */
      if (absoluteX < 0 || absoluteY < 0) {
        setActiveDropZone(null);
        return;
      }

      const targetZone = findDropZone(absoluteX, absoluteY);

      if (!targetZone) {
        setActiveDropZone(null);
        return;
      }

      setActiveDropZone({
        storyId: targetZone.storyId,
        statusId: targetZone.statusId,
      });
    },
    [findDropZone],
  );

  // ============================================================
  // UPDATE LOCAL TASK STATE
  // ============================================================

  const updateTaskLocalState = useCallback(
    (
      taskId: string,
      sourceStoryId: string,
      targetStoryId: string,
      targetStatusId: string,
    ) => {
      setLocalUserStories(prevStories => {
        const sourceStory = prevStories.find(
          story => story.id === sourceStoryId,
        );

        if (!sourceStory) {
          return prevStories;
        }

        const movedTask = sourceStory.tasks?.find(task => task.id === taskId);

        if (!movedTask) {
          console.log('Task not found:', taskId);
          return prevStories;
        }

        // ======================================================
        // SAME USER STORY
        // Only status changes
        // ======================================================

        if (sourceStoryId === targetStoryId) {
          return prevStories.map(story => {
            if (story.id !== sourceStoryId) {
              return story;
            }

            return {
              ...story,
              tasks: (story.tasks ?? []).map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      status_id: targetStatusId,
                    }
                  : task,
              ),
            };
          });
        }

        // ======================================================
        // DIFFERENT USER STORY
        // ======================================================

        return prevStories.map(story => {
          // Remove from source story
          if (story.id === sourceStoryId) {
            return {
              ...story,
              tasks: (story.tasks ?? []).filter(task => task.id !== taskId),
              totalTasks: Math.max(0, (story.totalTasks ?? 0) - 1),
            };
          }

          // Add to target story
          if (story.id === targetStoryId) {
            return {
              ...story,
              tasks: [
                ...(story.tasks ?? []),
                {
                  ...movedTask,
                  status_id: targetStatusId,
                },
              ],
              totalTasks: (story.totalTasks ?? 0) + 1,
            };
          }

          return story;
        });
      });
    },
    [],
  );

  // ============================================================
  // HANDLE TASK DROP
  // ============================================================

  const handleTaskDrop = useCallback(
    (
      task: Task,
      sourceStoryId: string,
      sourceStatusId: string,
      absoluteX: number,
      absoluteY: number,
    ) => {
      // --------------------------------------------------------
      // Clear hover indication
      // --------------------------------------------------------

      setActiveDropZone(null);

      // --------------------------------------------------------
      // Find actual target cell
      // --------------------------------------------------------

      const targetZone = findDropZone(absoluteX, absoluteY);

      if (!targetZone) {
        console.log('❌ No valid drop zone', absoluteX, absoluteY);

        return;
      }

      const targetStoryId = targetZone.storyId;
      const targetStatusId = targetZone.statusId;

      console.log('🎯 DROP TARGET', {
        taskId: task.id,
        sourceStoryId,
        sourceStatusId,
        targetStoryId,
        targetStatusId,
        absoluteX,
        absoluteY,
      });

      // --------------------------------------------------------
      // Same cell
      // --------------------------------------------------------

      if (
        sourceStoryId === targetStoryId &&
        sourceStatusId === targetStatusId
      ) {
        console.log('Dropped in same cell');
        return;
      }

      // --------------------------------------------------------
      // Find source task
      // --------------------------------------------------------

      const sourceStory = localUserStories.find(
        story => story.id === sourceStoryId,
      );

      const sourceTask = sourceStory?.tasks?.find(item => item.id === task.id);

      if (!sourceTask) {
        console.log('❌ Source task not found:', task.id);

        return;
      }

      // --------------------------------------------------------
      // Show success indication
      // --------------------------------------------------------

      setDropSuccessZone({
        storyId: targetStoryId,
        statusId: targetStatusId,
      });

      // --------------------------------------------------------
      // Optimistic local update
      // --------------------------------------------------------

      updateTaskLocalState(
        task.id,
        sourceStoryId,
        targetStoryId,
        targetStatusId,
      );

      // --------------------------------------------------------
      // API
      // --------------------------------------------------------

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

          // ====================================================
          // SUCCESS
          // ====================================================

          onSuccess: response => {
            console.log('✅ Task updated successfully:', response);

            setTimeout(() => {
              setDropSuccessZone(null);
            }, 700);
          },

          // ====================================================
          // ERROR
          // ====================================================

          onError: error => {
            console.error('❌ Failed to update task:', error);

            setDropSuccessZone(null);

            // ----------------------------------------------
            // Rollback
            // ----------------------------------------------

            setLocalUserStories(prevStories =>
              prevStories.map(story => {
                // Remove from target
                if (story.id === targetStoryId) {
                  return {
                    ...story,

                    tasks: (story.tasks ?? []).filter(
                      item => item.id !== task.id,
                    ),

                    totalTasks:
                      sourceStoryId === targetStoryId
                        ? story.totalTasks
                        : Math.max(0, (story.totalTasks ?? 0) - 1),
                  };
                }

                // Restore source
                if (story.id === sourceStoryId) {
                  return {
                    ...story,

                    tasks: [...(story.tasks ?? []), sourceTask],

                    totalTasks:
                      sourceStoryId === targetStoryId
                        ? story.totalTasks
                        : (story.totalTasks ?? 0) + 1,
                  };
                }

                return story;
              }),
            );
          },

          // ====================================================
          // FINALLY
          // ====================================================

          onFinally: () => {
            console.log('Task update completed');
          },
        }),
      );
    },
    [dispatch, findDropZone, localUserStories, projectId, updateTaskLocalState],
  );

  // ============================================================
  // RENDER
  // ============================================================

  console.log('LINE973', getCurrentSprintLoading);

  return (
    <ScrollView
      className='flex-1'
      style={{
        backgroundColor: colors.surface,
        paddingTop: moderateScale(20),
      }}
    >
      {/* ======================================================
          BOARD HEADER
          ====================================================== */}

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
          style={{
            marginTop: moderateScale(4),
            opacity: 0.5,
          }}
        >
          Visualize and manage your team's tasks across workflow stages
        </AppText>
      </View>

      {/* ======================================================
          VERTICAL BOARD SCROLL
          ====================================================== */}

      <Animated.ScrollView
        ref={verticalScrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event => {
          verticalScrollOffset.value = event.nativeEvent.contentOffset.y;
        }}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        {/* ====================================================
            HORIZONTAL BOARD SCROLL
            ==================================================== */}

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
          <View>
            {/* ==================================================
                BOARD HEADER
                ================================================== */}

            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: '#D1D5DB',
              }}
            >
              {/* User Stories Header */}

              <View
                style={{
                  width: USER_STORY_WIDTH,
                  padding: 12,
                }}
              >
                <AppText variant='body' className='font-bold'>
                  User Stories
                </AppText>
              </View>

              {/* Status Headers */}

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
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
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

            {/* ==================================================
                USER STORY ROWS
                ================================================== */}

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
          </View>
        </Animated.ScrollView>
      </Animated.ScrollView>
    </ScrollView>
  );
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

export default ProjectDeatailsScreen;
