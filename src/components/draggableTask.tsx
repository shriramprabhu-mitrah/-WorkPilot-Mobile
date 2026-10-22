import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  scrollTo,
  AnimatedRef,
  SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { BoardTask } from '../types/project.type';
import { ThemeColors } from '../constants/Colors';
import TaskCard from './TaskCard';

type DraggableTaskProps = {
  task: BoardTask;
  sourceStoryId: string;
  sourceStatusId: string;
  projectId: string;
  onDrop: (
    task: BoardTask,
    sourceStoryId: string,
    sourceStatusId: string,
    absoluteX: number,
    absoluteY: number,
  ) => void;
  onHoverDropZone: (absoluteX: number, absoluteY: number) => void;
  onDragPreview: (task: BoardTask | null) => void;
  isDragPreviewing: boolean;
  onToggleTaskFavorite?: (storyId: string, taskId: string) => void;
  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
  dragPreviewX: SharedValue<number>;
  dragPreviewY: SharedValue<number>;
  colors: ThemeColors;
  canDrag?: boolean;
};

const DraggableTaskComponent = ({
  task,
  sourceStoryId,
  sourceStatusId,
  projectId,
  onDrop,
  onHoverDropZone,
  onDragPreview,
  isDragPreviewing,
  onToggleTaskFavorite,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
  dragPreviewX,
  dragPreviewY,
  colors,
  canDrag = true,
}: DraggableTaskProps) => {
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const lastHoverTime = useSharedValue(0);
  const lastHoverX = useSharedValue(-999);
  const lastHoverY = useSharedValue(-999);

  useAnimatedReaction(
    () => ({ x: dragX.value, y: dragY.value, dragging: isDragging.value }),
    current => {
      if (!current.dragging) return;

      const curX = horizontalScrollOffset?.value ?? 0;
      const curY = verticalScrollOffset?.value ?? 0;

      const SCROLL_STEP = 16;
      const EDGE_THRESHOLD_H = 45;
      const EDGE_THRESHOLD_TOP = 150;
      const EDGE_THRESHOLD_BOTTOM = viewportHeight - 80;

      if (current.x > viewportWidth - EDGE_THRESHOLD_H) {
        const next = curX + SCROLL_STEP;
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      } else if (current.x < EDGE_THRESHOLD_H && curX > 0) {
        const next = Math.max(0, curX - SCROLL_STEP);
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      }

      if (current.y > EDGE_THRESHOLD_BOTTOM) {
        const next = curY + SCROLL_STEP;
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      } else if (current.y < EDGE_THRESHOLD_TOP && curY > 0) {
        const next = Math.max(0, curY - SCROLL_STEP);
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      }
    },
  );

  const panGesture = Gesture.Pan()
    .enabled(canDrag)
    .activateAfterLongPress(200)
    .maxPointers(1)
    .onStart(event => {
      isDragging.value = true;
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      dragPreviewX.value = event.absoluteX;
      dragPreviewY.value = event.absoluteY;
      lastHoverX.value = event.absoluteX;
      lastHoverY.value = event.absoluteY;
      lastHoverTime.value = Date.now();
      scheduleOnRN(onDragPreview, task);
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })
    .onUpdate(event => {
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      dragPreviewX.value = event.absoluteX;
      dragPreviewY.value = event.absoluteY;

      const dx = Math.abs(event.absoluteX - lastHoverX.value);
      const dy = Math.abs(event.absoluteY - lastHoverY.value);
      const now = Date.now();
      if ((dx > 12 || dy > 12) && now - lastHoverTime.value > 50) {
        lastHoverX.value = event.absoluteX;
        lastHoverY.value = event.absoluteY;
        lastHoverTime.value = now;
        scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
      }
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
      scheduleOnRN(onDragPreview, null);
      isDragging.value = false;
      dragX.value = 0;
      dragY.value = 0;
    })
    .onFinalize(() => {
      scheduleOnRN(onHoverDropZone, -1, -1);
      scheduleOnRN(onDragPreview, null);
      isDragging.value = false;
      dragX.value = 0;
      dragY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value || isDragPreviewing ? 0.35 : 1,
    transform: [{ scale: isDragging.value ? 0.98 : 1 }],
  }));

  return (
    <View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
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
            onToggleFavorite={() =>
              onToggleTaskFavorite?.(sourceStoryId, task.id)
            }
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export const DraggableTask = React.memo(DraggableTaskComponent);
