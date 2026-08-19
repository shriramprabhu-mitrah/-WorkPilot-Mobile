import React, { useEffect, useMemo, useState } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

import {
  mapUserStoriesToColumns,
  BoardUserStory,
  Task,
} from '../data/projectDetailScreenData';

import { Radius } from '../constants/Radius';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  getUserStories,
  updateUserStory,
} from '../store/project_store/action/project_thunk';
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
import { UserStoryStatus } from '../types/project.type';
import { StackNavigationProp } from '@react-navigation/stack';

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'projectDetails'>;

const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;

// Inner Draggable Card Component
const DraggableUserStory = ({
  story,
  sourceColumnTitle,
  projectId,
  columnLayouts,
  onDropStory,
  setHoveredColumn,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
  expanded,
  onToggle,
}: {
  story: BoardUserStory;
  sourceColumnTitle: string;
  projectId: string;

  columnLayouts: Record<
    string,
    {
      xMin: number;
      xMax: number;
    }
  >;

  onDropStory: (
    storyId: string,
    sourceTitle: string,
    targetTitle: string,
  ) => void;

  setHoveredColumn: (title: string | null) => void;

  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;

  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;

  expanded: boolean;
  onToggle: () => void;
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const dragAbsoluteX = useSharedValue(0);
  const dragAbsoluteY = useSharedValue(0);

  const initialScrollX = useSharedValue(0);
  const initialScrollY = useSharedValue(0);

  /**
   * Auto scroll
   */
  useAnimatedReaction(
    () => ({
      x: dragAbsoluteX.value,
      y: dragAbsoluteY.value,
      active: isDragging.value,
    }),
    current => {
      if (!current.active) {
        return;
      }

      // Horizontal auto scroll
      if (current.x > 350) {
        horizontalScrollOffset.value += SCROLL_SPEED;

        scrollTo(horizontalScrollRef, horizontalScrollOffset.value, 0, false);
      } else if (current.x < EDGE_THRESHOLD) {
        horizontalScrollOffset.value = Math.max(
          0,
          horizontalScrollOffset.value - SCROLL_SPEED,
        );

        scrollTo(horizontalScrollRef, horizontalScrollOffset.value, 0, false);
      }

      // Vertical auto scroll
      if (current.y > 700) {
        verticalScrollOffset.value += SCROLL_SPEED;

        scrollTo(verticalScrollRef, 0, verticalScrollOffset.value, false);
      } else if (current.y < EDGE_THRESHOLD) {
        verticalScrollOffset.value = Math.max(
          0,
          verticalScrollOffset.value - SCROLL_SPEED,
        );

        scrollTo(verticalScrollRef, 0, verticalScrollOffset.value, false);
      }
    },
  );

  /**
   * Find target column
   *
   * IMPORTANT:
   * This function executes on JS thread because
   * it calls React setState.
   */
  const updateHoveredColumn = (absoluteX: number) => {
    const currentX = absoluteX + horizontalScrollOffset.value;

    let target: string | null = null;

    Object.entries(columnLayouts).forEach(([columnTitle, bounds]) => {
      if (currentX >= bounds.xMin && currentX <= bounds.xMax) {
        target = columnTitle;
      }
    });

    setHoveredColumn(target);
  };

  /**
   * Pan gesture
   */
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(150)

    .onStart(event => {
      isDragging.value = true;

      initialScrollX.value = horizontalScrollOffset.value;

      initialScrollY.value = verticalScrollOffset.value;

      dragAbsoluteX.value = event.absoluteX;
      dragAbsoluteY.value = event.absoluteY;
    })

    .onUpdate(event => {
      const scrollDiffX = horizontalScrollOffset.value - initialScrollX.value;

      const scrollDiffY = verticalScrollOffset.value - initialScrollY.value;

      translateX.value = event.translationX + scrollDiffX;

      translateY.value = event.translationY + scrollDiffY;

      dragAbsoluteX.value = event.absoluteX;
      dragAbsoluteY.value = event.absoluteY;

      /**
       * JS thread
       */
      scheduleOnRN(updateHoveredColumn, event.absoluteX);
    })

    .onEnd(event => {
      const dropX = event.absoluteX + horizontalScrollOffset.value;

      let targetColumn: string | null = null;

      Object.entries(columnLayouts).forEach(([columnTitle, bounds]) => {
        if (dropX >= bounds.xMin && dropX <= bounds.xMax) {
          targetColumn = columnTitle;
        }
      });

      /**
       * Clear hover
       */
      scheduleOnRN(setHoveredColumn, null);

      /**
       * Move story
       */
      if (targetColumn) {
        scheduleOnRN(onDropStory, story.id, sourceColumnTitle, targetColumn);
      }

      /**
       * Reset animation
       */
      translateX.value = 0;
      translateY.value = 0;

      isDragging.value = false;

      dragAbsoluteX.value = 0;
      dragAbsoluteY.value = 0;
    });

  /**
   * Animated style
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

  console.log('LINE258', story.tasks);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: Radius.sm,
            padding: 12,
          }}
        >
          {/* USER STORY HEADER */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('issue', {
                projectId,
                userStoryId: story?.id,
              })
            }
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <AppText
                  variant='body'
                  className='font-semibold'
                  onPress={onToggle}
                >
                  {expanded ? '▼' : '▶'} {story.title}
                </AppText>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: story.statusColor,
                    }}
                  />

                  <AppText variant='caption' color='#6B7280'>
                    {story.status}
                  </AppText>

                  <AppText variant='caption' color='#6B7280'>
                    {story.points}
                  </AppText>
                </View>
              </View>
            </View>

            {/* TASK SUMMARY */}

            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <AppText variant='caption' color='#6B7280'>
                {story.completedTasks} / {story.totalTasks} tasks
              </AppText>

              <AppText variant='caption' color='#6B7280'>
                {story.progress}%
              </AppText>
            </View>
          </TouchableOpacity>

          {/* EXPANDED TASKS */}

          {expanded && story.tasks?.length > 0 && (
            <View
              style={{
                marginTop: 12,
                gap: 8,
              }}
            >
              {story.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  item={{
                    id: task?.key,
                    title: task.title,
                    priority: task.priority,
                    points: `${task?.story_points ?? 0}p`,
                    avatar:
                      task?.assignee_name?.charAt(0)?.toUpperCase() || '?',
                    avatarColor: '#6366F1',
                  }}
                  projectId={projectId}
                />
              ))}
            </View>
          )}

          {expanded && (!story.tasks || story.tasks.length === 0) && (
            <View
              style={{
                marginTop: 12,
                paddingVertical: 10,
              }}
            >
              <AppText variant='caption' color='#6B7280'>
                No tasks available
              </AppText>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

// Main Screen Component
const ProjectDeatailsScreen = () => {
  const dispatch = useAppDispatch();

  const route = useRoute<ProjectDetailsRouteProp>();

  const { colors, strings } = useTheme();

  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();

  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();

  const horizontalScrollOffset = useSharedValue(0);

  const verticalScrollOffset = useSharedValue(0);

  const { project, userStories } = useAppSelector(
    (state: RootState) => state.projects,
  );

  const columnStatuses: UserStoryStatus[] = [
    'todo',
    'in_progress',
    'in_review',
    'completed',
    'testing',
    'blocked',
  ];

  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [localUserStories, setLocalUserStories] = useState<BoardUserStory[]>(
    [],
  );

  /*
   * Store expanded state by USER STORY ID.
   */
  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});

  const [columnLayouts, setColumnLayouts] = useState<
    Record<
      string,
      {
        xMin: number;
        xMax: number;
      }
    >
  >({});

  /*
   * Convert API response into:
   *
   * TO DO
   *   -> User Stories
   *
   * IN PROGRESS
   *   -> User Stories
   *
   * etc.
   */

  const projectId = project?.id;

  /*
   * Get active/planning sprint.
   */
  const activeSprint =
    project?.sprints?.find(sprint => sprint.status === 'active') ??
    project?.sprints?.find(sprint => sprint.status === 'planning');

  /*
   * Fetch user stories.
   */
  useEffect(() => {
    if (!projectId) {
      console.log('No project found');
      return;
    }

    if (!activeSprint?.id) {
      console.log('No sprint found');
      return;
    }

    console.log('Fetching user stories:', {
      projectId,
      sprintId: activeSprint.id,
    });

    dispatch(
      getUserStories({
        projectId,
        payload: {
          page: 1,
          page_size: 100,
          sprint_id: activeSprint.id,
        },
      }),
    );
  }, [dispatch, projectId, activeSprint?.id]);

  useEffect(() => {
    if (userStories) {
      setLocalUserStories(userStories);
    }
  }, [userStories]);

  const boardColumns = useMemo(() => {
    return mapUserStoriesToColumns(localUserStories, strings, colors);
  }, [localUserStories, strings, colors]);
  /*
   * Expand / collapse USER STORY.
   */
  const toggleStory = (storyId: string) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  };

  /*
   * Column layout.
   */
  const handleColumnLayout = (title: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setColumnLayouts(prev => ({
      ...prev,
      [title]: {
        xMin: x,
        xMax: x + width,
      },
    }));
  };

  /*
   * Move USER STORY between columns.
   *
   * NOTE:
   * This currently changes local board state only.
   * To persist the status, you'll need a backend
   * update-user-story API.
   */
  const handleDropStory = (
    storyId: string,
    sourceTitle: string,
    targetTitle: string,
  ) => {
    if (sourceTitle === targetTitle) {
      return;
    }

    const targetColumnIndex = boardColumns.findIndex(
      column => column.title === targetTitle,
    );

    if (targetColumnIndex === -1) {
      return;
    }

    const newStatus = columnStatuses[targetColumnIndex];

    // Find the story before changing it
    const story = localUserStories.find(item => item.id === storyId);

    if (!story) {
      return;
    }

    const previousStatus = story.status;

    console.log('Moving user story:', {
      storyId,
      previousStatus,
      newStatus,
    });

    // --------------------------------------------------
    // 1. Update UI immediately
    // --------------------------------------------------

    setLocalUserStories(prevStories =>
      prevStories.map(item => {
        if (item.id !== storyId) {
          return item;
        }

        return {
          ...item,
          status: newStatus,
        };
      }),
    );

    // --------------------------------------------------
    // 2. Update backend
    // --------------------------------------------------

    dispatch(
      updateUserStory({
        projectId: project?.id as string,
        userStoryId: storyId,

        payload: {
          status: newStatus,
        },

        onSuccess: response => {
          console.log('User story status updated successfully:', response);
        },

        onError: error => {
          console.error('Failed to update user story status:', error);

          // --------------------------------------------------
          // 3. Rollback UI if API fails
          // --------------------------------------------------

          setLocalUserStories(prevStories =>
            prevStories.map(item => {
              if (item.id !== storyId) {
                return item;
              }

              return {
                ...item,
                status: previousStatus,
              };
            }),
          );
        },

        onFinally: () => {
          console.log('Update user story API completed');
        },
      }),
    );
  };
  console.log('USER STORIES:', userStories);

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
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
          {boardColumns.map(column => {
            const isFocused = hoveredColumn === column.title;

            return (
              <View
                key={column.title}
                onLayout={event => handleColumnLayout(column.title, event)}
                style={{
                  width: moderateScale(280),

                  paddingRight: layout.elementGap,

                  gap: layout.tightGap,

                  backgroundColor: isFocused
                    ? `${colors.primary}12`
                    : 'transparent',

                  borderWidth: isFocused ? 2 : 0,

                  borderColor: colors.primary,

                  borderRadius: Radius.md,

                  padding: isFocused ? layout.tightGap : 0,
                }}
              >
                {/* =========================================
                      COLUMN HEADER
                  ========================================= */}

                <View
                  className='flex-row items-center justify-between'
                  style={{
                    paddingHorizontal: layout.paddingHorizontal * 0.25,

                    paddingTop: layout.paddingTop,

                    paddingBottom: layout.paddingBottom,
                  }}
                >
                  <View
                    className='flex-row items-center'
                    style={{
                      gap: layout.sectionGap,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: Radius.circle,

                        width: moderateScale(10),

                        height: moderateScale(10),

                        backgroundColor: column.color,
                      }}
                    />

                    <AppText
                      variant='body'
                      color={colors.text}
                      className='font-bold'
                    >
                      {column.title}
                    </AppText>

                    <View
                      style={{
                        backgroundColor: colors.border,

                        paddingHorizontal: layout.paddingHorizontal * 0.25,

                        borderRadius: Radius.circle,
                      }}
                    >
                      <AppText variant='caption' color={colors.textSecondary}>
                        {column.userStories.length}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* =========================================
                      USER STORIES
                  ========================================= */}

                <View
                  style={{
                    gap: layout.elementGap,
                  }}
                >
                  {column.userStories.map(story => (
                    <DraggableUserStory
                      key={story.id}
                      story={story}
                      projectId={project?.id || ''}
                      sourceColumnTitle={column.title}
                      columnLayouts={columnLayouts}
                      onDropStory={handleDropStory}
                      setHoveredColumn={setHoveredColumn}
                      horizontalScrollRef={horizontalScrollRef}
                      verticalScrollRef={verticalScrollRef}
                      horizontalScrollOffset={horizontalScrollOffset}
                      verticalScrollOffset={verticalScrollOffset}
                      expanded={!!expandedStories[story.id]}
                      onToggle={() => toggleStory(story.id)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </Animated.ScrollView>
      </Animated.ScrollView>
    </Screen>
  );
};

export default ProjectDeatailsScreen;
