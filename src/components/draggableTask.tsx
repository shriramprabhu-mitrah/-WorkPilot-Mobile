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
};

export const DraggableTask = ({
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
}: DraggableTaskProps) => {
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  useAnimatedReaction(
    () => ({ x: dragX.value, y: dragY.value, dragging: isDragging.value }),
    current => {
      if (!current.dragging) return;

      const curX = horizontalScrollOffset?.value ?? 0;
      const curY = verticalScrollOffset?.value ?? 0;

      if (current.x > viewportWidth - 40) {
        const next = curX + 100;
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      } else if (current.x < 40) {
        const next = Math.max(0, curX - 100);
        horizontalScrollOffset.value = next;
        scrollTo(horizontalScrollRef, next, 0, false);
      }

      if (current.y > viewportHeight - 80) {
        const next = curY + 100;
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      } else if (current.y < 300) {
        const next = Math.max(0, curY - 100);
        verticalScrollOffset.value = next;
        scrollTo(verticalScrollRef, 0, next, false);
      }
    },
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(event => {
      isDragging.value = true;
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      dragPreviewX.value = event.absoluteX;
      dragPreviewY.value = event.absoluteY;
      scheduleOnRN(onDragPreview, task);
      scheduleOnRN(onHoverDropZone, event.absoluteX, event.absoluteY);
    })
    .onUpdate(event => {
      dragX.value = event.absoluteX;
      dragY.value = event.absoluteY;
      dragPreviewX.value = event.absoluteX;
      dragPreviewY.value = event.absoluteY;
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
    // The source remains parked in its list slot; only the overlay follows the finger.
    transform: [{ scale: 1 }],
    zIndex: 1,
    elevation: 0,
    shadowColor: isDragging.value ? colors.black : 'transparent',
    shadowOffset: { width: 0, height: isDragging.value ? 4 : 0 },
    shadowOpacity: isDragging.value ? 0.2 : 0,
    shadowRadius: isDragging.value ? 8 : 0,
  }));

  return (
    <View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedStyle, isDragPreviewing && { opacity: 0 }]}
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
            onToggleFavorite={() =>
              onToggleTaskFavorite?.(sourceStoryId, task.id)
            }
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
