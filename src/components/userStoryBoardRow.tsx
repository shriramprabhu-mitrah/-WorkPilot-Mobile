import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { AnimatedRef, SharedValue } from 'react-native-reanimated';
import {
  BoardStatusColumn,
  BoardStory,
  BoardTask,
  ColumnTaskState,
  DropZone,
} from '../types/project.type';
import { ThemeColors } from '../constants/Colors';
import { RootStackParamList } from '../types/navigationTypes';
import { moderateScale } from '../utils/responsive';
import AppText from './common/AppText';
import { TaskDropZone } from './taskDropZone';
import { DraggableTask } from './draggableTask';

type UserStoryBoardRowProps = {
  story: BoardStory;
  projectId: string;
  columns: BoardStatusColumn[];
  expanded: boolean;
  onToggle: () => void;
  onRegisterDropZone: (zone: DropZone) => void;
  onTaskDrop: (
    task: BoardTask,
    sourceStoryId: string,
    sourceStatusId: string,
    absoluteX: number,
    absoluteY: number,
  ) => void;
  onHoverDropZone: (absoluteX: number, absoluteY: number) => void;
  onDragPreview: (task: BoardTask | null) => void;
  dragPreviewTaskId: string | null;
  onToggleStoryFavorite?: (storyId: string) => void;
  onToggleTaskFavorite?: (storyId: string, taskId: string) => void;
  activeDropZone: { storyId: string; statusId: string } | null;
  dropSuccessZone: { storyId: string; statusId: string } | null;
  horizontalScrollRef: AnimatedRef<Animated.ScrollView>;
  verticalScrollRef: AnimatedRef<Animated.ScrollView>;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
  dragPreviewX: SharedValue<number>;
  dragPreviewY: SharedValue<number>;
  taskPagination: Record<string, Record<string, ColumnTaskState>>;
  onLoadMoreTasks: (storyId: string, statusId: string) => void;
  colors: ThemeColors;
};

export const UserStoryBoardRow = ({
  story,
  projectId,
  columns,
  expanded,
  onToggle,
  onRegisterDropZone,
  onTaskDrop,
  onHoverDropZone,
  onDragPreview,
  dragPreviewTaskId,
  onToggleStoryFavorite,
  onToggleTaskFavorite,
  activeDropZone,
  dropSuccessZone,
  horizontalScrollRef,
  verticalScrollRef,
  horizontalScrollOffset,
  verticalScrollOffset,
  dragPreviewX,
  dragPreviewY,
  colors,
  taskPagination,
  onLoadMoreTasks,
}: UserStoryBoardRowProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: expanded ? 250 : 100,
      }}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('issue', {
            projectId,
            userStoryId: story?.id,
            story: story as any,
          })
        }
        activeOpacity={0.7}
        style={{
          width: moderateScale(250),
          minHeight: 90,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: colors.card || colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onToggle();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 22,
              height: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText
              style={{
                fontSize: 15,
                lineHeight: 14,
                color: colors.text,
              }}
            >
              {expanded ? '▼' : '▶'}
            </AppText>
          </TouchableOpacity>

          <View
            style={{
              width: 18,
              height: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 6,
                backgroundColor: story.status_color || colors.textSecondary,
              }}
            />
          </View>

          <View
            style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: 4,
              paddingRight: 8,
            }}
          >
            <AppText
              variant='body'
              className='font-semibold'
              numberOfLines={1}
              ellipsizeMode='tail'
              style={{
                lineHeight: 20,
                color: colors.text,
              }}
            >
              {story.title}
            </AppText>

            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{
                marginTop: 2,
                lineHeight: 17,
              }}
            >
              {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
            </AppText>
          </View>

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onToggleStoryFavorite?.(story.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 28,
              height: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText
              style={{
                color: story.is_favourite
                  ? colors.warning
                  : colors.textSecondary,
                fontSize: 20,
                lineHeight: 22,
              }}
            >
              {story.is_favourite ? '★' : '☆'}
            </AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {columns.map(statusCol => {
        const columnData = story.statuses?.find(
          s => s.status_id === statusCol.status_id,
        );
        const tasks = columnData?.tasks ?? [];

        const isActive =
          activeDropZone?.storyId === story.id &&
          activeDropZone?.statusId === statusCol.status_id;

        const isSuccess =
          dropSuccessZone?.storyId === story.id &&
          dropSuccessZone?.statusId === statusCol.status_id;
        const columnPaginationState =
          taskPagination[story.id]?.[statusCol.status_id];

        return (
          <TaskDropZone
            key={`${story.id}-${statusCol.status_id}`}
            storyId={story.id}
            statusId={statusCol.status_id}
            onRegister={onRegisterDropZone}
            isActive={isActive}
            isSuccess={isSuccess}
            horizontalScrollOffset={horizontalScrollOffset}
            verticalScrollOffset={verticalScrollOffset}
            colors={colors}
            expanded={expanded}
            columnState={columnPaginationState}
            onLoadMoreTasks={onLoadMoreTasks}
          >
            {expanded &&
              tasks.map(task => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  sourceStoryId={story.id}
                  sourceStatusId={statusCol.status_id}
                  projectId={projectId}
                  onDrop={onTaskDrop}
                  onHoverDropZone={onHoverDropZone}
                  onDragPreview={onDragPreview}
                  isDragPreviewing={dragPreviewTaskId === task.id}
                  onToggleTaskFavorite={onToggleTaskFavorite}
                  horizontalScrollRef={horizontalScrollRef}
                  verticalScrollRef={verticalScrollRef}
                  horizontalScrollOffset={horizontalScrollOffset}
                  verticalScrollOffset={verticalScrollOffset}
                  dragPreviewX={dragPreviewX}
                  dragPreviewY={dragPreviewY}
                  colors={colors}
                />
              ))}
          </TaskDropZone>
        );
      })}
    </View>
  );
};
