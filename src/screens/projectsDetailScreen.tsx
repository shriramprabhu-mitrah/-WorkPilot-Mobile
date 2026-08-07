import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useAnimatedRef,
  useAnimatedReaction,
  scrollTo,
  AnimatedRef,
  SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { getColumns, getRecentProjects } from '../data/projectDetailScreenData';
import { Radius } from '../constants/Radius';

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'projectDetails'>;

interface TaskItem {
  id: string;
  title: string;
  priority: string;
  points: string;
  avatar: string;
  avatarColor: string;
}

interface ColumnData {
  title: string;
  color: string;
  tasks: TaskItem[];
}

const EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 12;

// Inner Draggable Card Component
const DraggableTaskCard = ({
  item,
  index,
  sourceColumnTitle,
  columnLayouts,
  onDropTask,
  setHoveredColumn,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
}: {
  item: TaskItem;
  index: number;
  sourceColumnTitle: string;
  columnLayouts: Record<string, { xMin: number; xMax: number }>;
  onDropTask: (
    taskId: string,
    sourceTitle: string,
    targetTitle: string,
    dropY: number,
  ) => void;
  setHoveredColumn: (colTitle: string | null) => void;
  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Absolute touch tracking
  const dragAbsoluteX = useSharedValue(0);
  const dragAbsoluteY = useSharedValue(0);

  // Scroll compensation
  const initialScrollX = useSharedValue(0);
  const initialScrollY = useSharedValue(0);

  // Auto-scroll loop
  useAnimatedReaction(
    () => ({
      x: dragAbsoluteX.value,
      y: dragAbsoluteY.value,
      active: isDragging.value,
    }),
    current => {
      if (!current.active) return;

      // Horizontal Scroll
      if (current.x > screenWidth - EDGE_THRESHOLD) {
        horizontalScrollOffset.value += SCROLL_SPEED;
        scrollTo(horizontalScrollRef, horizontalScrollOffset.value, 0, false);
      } else if (current.x < EDGE_THRESHOLD) {
        horizontalScrollOffset.value = Math.max(
          0,
          horizontalScrollOffset.value - SCROLL_SPEED,
        );
        scrollTo(horizontalScrollRef, horizontalScrollOffset.value, 0, false);
      }

      // Vertical Scroll
      if (current.y > screenHeight - EDGE_THRESHOLD) {
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

  const updateHoveredColumn = (absX: number) => {
    const currentX = absX + horizontalScrollOffset.value;
    let target: string | null = null;
    Object.entries(columnLayouts).forEach(([colTitle, bounds]) => {
      if (currentX >= bounds.xMin && currentX <= bounds.xMax) {
        target = colTitle;
      }
    });
    setHoveredColumn(target);
  };

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

      runOnJS(updateHoveredColumn)(event.absoluteX);
    })
    .onEnd(event => {
      const dropX = event.absoluteX + horizontalScrollOffset.value;
      const dropY = event.absoluteY + verticalScrollOffset.value;

      let targetColumn: string | null = null;
      Object.entries(columnLayouts).forEach(([colTitle, bounds]) => {
        if (dropX >= bounds.xMin && dropX <= bounds.xMax) {
          targetColumn = colTitle;
        }
      });

      runOnJS(setHoveredColumn)(null);

      if (targetColumn) {
        runOnJS(onDropTask)(item.id, sourceColumnTitle, targetColumn, dropY);
      }

      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      dragAbsoluteX.value = 0;
      dragAbsoluteY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? 1.05 : 1 },
    ],
    zIndex: isDragging.value ? 9999 : 1,
    elevation: isDragging.value ? 12 : 0,
    shadowColor: '#000',
    shadowOpacity: isDragging.value ? 0.35 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <TaskCard item={item} />
      </Animated.View>
    </GestureDetector>
  );
};

// Main Screen Component
const ProjectDeatailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  const verticalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const horizontalScrollOffset = useSharedValue(0);
  const verticalScrollOffset = useSharedValue(0);

  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const [boardColumns, setBoardColumns] = useState<ColumnData[]>(() =>
    getColumns(strings, colors),
  );
  const [columnLayouts, setColumnLayouts] = useState<
    Record<string, { xMin: number; xMax: number }>
  >({});

  const projectId = route.params?.id;
  const recentProjects = getRecentProjects(colors);
  const project = recentProjects.find(p => p.type === projectId);

  const handleColumnLayout = (title: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setColumnLayouts(prev => ({
      ...prev,
      [title]: { xMin: x, xMax: x + width },
    }));
  };

  // Handles both cross-column moving and same-column reordering
  const handleDropTask = (
    taskId: string,
    sourceTitle: string,
    targetTitle: string,
    dropY: number,
  ) => {
    setBoardColumns(prevColumns => {
      const isSameColumn = sourceTitle === targetTitle;

      if (isSameColumn) {
        return prevColumns.map(col => {
          if (col.title === sourceTitle) {
            const currentTasks = [...col.tasks];
            const taskIndex = currentTasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return col;

            const [movedTask] = currentTasks.splice(taskIndex, 1);

            // Simple position estimation index shift based on relative touch drag offset
            const targetIndex = Math.min(
              Math.max(0, Math.floor(dropY / 120)),
              currentTasks.length,
            );

            currentTasks.splice(targetIndex, 0, movedTask);
            return { ...col, tasks: currentTasks };
          }
          return col;
        });
      }

      // Cross-column drop
      let movedTask: TaskItem | undefined;
      const updated = prevColumns.map(col => {
        if (col.title === sourceTitle) {
          movedTask = col.tasks.find(t => t.id === taskId);
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        return col;
      });

      if (movedTask) {
        return updated.map(col => {
          if (col.title === targetTitle) {
            return { ...col, tasks: [...col.tasks, movedTask!] };
          }
          return col;
        });
      }

      return prevColumns;
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Screen scroll={false} backgroundColor={colors.surface}>
        {/* FIXED HEADER AT TOP */}
        <View
          style={{
            backgroundColor: project?.color || colors.primary,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
          }}
        >
          <View className='flex-row items-center justify-between'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('HomeTabs', { screen: 'Project' })
              }
            >
              <Ionicons
                name='arrow-back'
                size={layout.iconSize * 1.25}
                color={colors.white}
              />
            </TouchableOpacity>

            <View className='flex-row' style={{ gap: layout.sectionGap }}>
              <TouchableOpacity
                activeOpacity={0.8}
                className='items-center justify-center'
                style={{
                  borderRadius: Radius.circle,
                  backgroundColor: `${colors.white}2A`,
                  width: layout.iconSize * 2,
                  height: layout.iconSize * 2,
                }}
              >
                <Ionicons
                  name='funnel-outline'
                  size={18}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className='items-center justify-center'
                style={{
                  borderRadius: Radius.circle,
                  backgroundColor: `${colors.white}2A`,
                  width: layout.iconSize * 2,
                  height: layout.iconSize * 2,
                }}
              >
                <Ionicons
                  name='ellipsis-horizontal'
                  size={18}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: layout.tightGap }}>
            <AppText variant='title' color={colors.white} className='font-bold'>
              {project?.name ||
                strings.projectDetails?.defaultTitle ||
                'Project'}
            </AppText>
            <AppText
              variant='body'
              color={colors.white}
              className='font-semibold'
            >
              {project?.type || 'Software project'} ·{' '}
              {strings.projectDetails?.softwareType || 'Software project'}
            </AppText>

            <View
              className='flex-row items-center self-start'
              style={{
                marginVertical: layout.sectionGap,
                borderRadius: Radius.circle,
                backgroundColor: `${colors.white}2A`,
                paddingHorizontal: layout.paddingHorizontal * 0.5,
                paddingTop: layout.paddingTop * 0.5,
                paddingBottom: layout.paddingBottom * 0.5,
                gap: layout.elementGap,
              }}
            >
              <View
                style={{
                  borderRadius: Radius.circle,
                  width: moderateScale(8),
                  height: moderateScale(8),
                  backgroundColor: colors.success,
                }}
              />
              <AppText
                variant='caption'
                color={colors.white}
                className='font-semibold'
              >
                {strings.projectDetails?.sprintInfo ||
                  'Sprint 14 · 6 days left'}
              </AppText>
            </View>
          </View>
        </View>

        {/* FIXED TABS NAVIGATION BAR */}
        <View
          className='flex-row border-b'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            className='flex-1 border-b-2'
            style={{
              borderColor: colors.primary,
              paddingVertical: layout.elementGap,
            }}
          >
            <AppText
              variant='body'
              color={colors.primary}
              className='text-center font-bold'
            >
              {strings.projectDetails?.boardTab || 'Board'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BackLogs')}
            className='flex-1'
            style={{
              paddingVertical: layout.elementGap,
            }}
          >
            <AppText
              variant='body'
              color={colors?.textSecondary}
              className='text-center font-semibold'
            >
              {strings.projectDetails?.backlogTab || 'Backlog'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* SCREEN-WIDE SCROLL CONTAINER BELOW THE NAVIGATION BAR */}
        <Animated.ScrollView
          ref={verticalScrollRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={e => {
            verticalScrollOffset.value = e.nativeEvent.contentOffset.y;
          }}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
          }}
        >
          {/* Horizontal Board ScrollView */}
          <Animated.ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={e => {
              horizontalScrollOffset.value = e.nativeEvent.contentOffset.x;
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
                  {/* Column Header */}
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
                      style={{ gap: layout.sectionGap }}
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
                          {column.tasks.length}
                        </AppText>
                      </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.7}>
                      <Ionicons
                        name='add'
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Task List */}
                  <View style={{ gap: layout.elementGap }}>
                    {column.tasks.map((item, index) => (
                      <DraggableTaskCard
                        key={item.id}
                        item={item}
                        index={index}
                        sourceColumnTitle={column.title}
                        columnLayouts={columnLayouts}
                        onDropTask={handleDropTask}
                        setHoveredColumn={setHoveredColumn}
                        horizontalScrollRef={horizontalScrollRef}
                        verticalScrollRef={verticalScrollRef}
                        horizontalScrollOffset={horizontalScrollOffset}
                        verticalScrollOffset={verticalScrollOffset}
                      />
                    ))}

                    {/* Add issue button */}
                    {column.title ===
                      (strings.projectDetails?.toDo || 'TO DO') && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('newIssues')}
                        className='items-center justify-center border-2 border-dashed'
                        style={{
                          borderRadius: Radius.sm,
                          paddingTop: layout.paddingTop,
                          paddingBottom: layout.paddingBottom,
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        }}
                      >
                        <AppText variant='body' color={colors.textSecondary}>
                          + {strings.projectDetails?.addIssue || 'Add issue'}
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.ScrollView>
        </Animated.ScrollView>
      </Screen>
    </GestureHandlerRootView>
  );
};

export default ProjectDeatailsScreen;
