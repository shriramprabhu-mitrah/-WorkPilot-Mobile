import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { getPriorityThemeColor } from '../utils/enum';
import { ThemeColors } from '../constants/Colors';
import { useAppDispatch } from '../store';
import { Task } from '../types/project.type';
import { getTasks } from '../store/task_store/action/task.thunk';
import { TaskMeta } from '../types/task.type';
import { TaskRowsSkeleton } from './skeleton/issueDetailSkeleton';

interface Props {
  tasks: Task[];
  colors: ThemeColors;
  projectId: string | undefined;
  navigation: any;
  meta?: TaskMeta | null;
  loading?: boolean;
  loadingMore?: boolean;
  userStoryId?: string;
}

export const IssueChildTasksSection: React.FC<Props> = ({
  tasks,
  colors,
  projectId,
  navigation,
  meta,
  loading = false,
  loadingMore = false,
  userStoryId,
}) => {
  const dispatch = useAppDispatch();
  const { layout } = useAuthLayout();
  const [isExpanded, setIsExpanded] = useState(false);
  const taskCount = meta?.total_items ?? tasks.length;
  const visibleTasks = isExpanded ? tasks : tasks.slice(0, 4);

  const renderTaskRow = ({ item }: { item: Task }) => {
    const rawPriority = (item.priority || '').toLowerCase();
    const taskPriorityColor = getPriorityThemeColor(rawPriority, colors);
    const avatarLetter = (item.assignee_name || 'U').charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.push('issue', {
            projectId,
            taskId: item.id,
            task: item,
            userStoryId,
            fromUserStory: true,
          })
        }
        className='flex-row items-center justify-evenly border-b py-3'
        style={{ borderColor: colors.border }}
      >
        <View style={{ flex: 1.5 }}>
          <AppText
            variant='body'
            color={colors.text}
            className='font-semibold'
            numberOfLines={1}
          >
            {item.title || 'Untitled Task'}
          </AppText>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            numberOfLines={1}
          >
            {item.key || item.formatted_serial_number || 'N/A'}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <View
            className='self-start rounded-full px-2 py-1'
            style={{ backgroundColor: `${taskPriorityColor}15` }}
          >
            <AppText
              variant='caption'
              color={taskPriorityColor}
              className='text-xs font-semibold capitalize'
            >
              {item.priority}
            </AppText>
          </View>
        </View>
        <View className='flex-row items-center' style={{ flex: 1, gap: 8 }}>
          <View
            className='h-7 w-7 items-center justify-center rounded-full'
            style={{ backgroundColor: colors.primary || '#0066FF' }}
          >
            <AppText
              variant='caption'
              color={colors.white}
              className='text-xs font-bold'
            >
              {avatarLetter}
            </AppText>
          </View>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            numberOfLines={1}
          >
            {item.assignee_name || 'Unassigned'}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View
      className='flex-row justify-between border-b py-2'
      style={{ borderColor: colors.border }}
    >
      <View style={{ flex: 1.5 }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          className='font-bold uppercase'
        >
          Work
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          className='font-bold uppercase'
        >
          Priority
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          className='font-bold uppercase'
        >
          Assignee
        </AppText>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return <TaskRowsSkeleton taskCount={1} />;
  };

  const handleEndReached = () => {
    if (
      !loadingMore &&
      !loading &&
      meta?.has_next &&
      projectId &&
      userStoryId
    ) {
      dispatch(
        getTasks({
          projectId,
          page: meta.page + 1,
          page_size: meta.page_size || 8,
          user_story_id: userStoryId,
        }),
      );
    }
  };

  if (!loading && tasks.length === 0) {
    return (
      <View
        className='mt-3'
        style={{
          backgroundColor: colors.card || colors.surface,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.sectionGap,
        }}
      >
        <View className='mb-3 flex-row items-center justify-between'>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
          >
            Tasks ({taskCount})
          </AppText>
        </View>
        <AppText variant='body' color={colors.textSecondary}>
          No child tickets.
        </AppText>
      </View>
    );
  }

  return (
    <View
      className='mt-3'
      style={{
        backgroundColor: colors.card || colors.surface,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.sectionGap,
      }}
    >
      <View className='mb-3 flex-row items-center justify-between'>
        <AppText variant='bodyLarge' color={colors.text} className='font-bold'>
          Tasks ({taskCount})
        </AppText>
        {tasks.length > 4 && (
          <TouchableOpacity
            onPress={() => setIsExpanded(prev => !prev)}
            activeOpacity={0.7}
          >
            <AppText
              variant='body'
              color={colors.primary}
              className='font-semibold'
            >
              {isExpanded ? 'View less' : 'View more'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {renderHeader()}

      {loading && tasks.length === 0 ? (
        <TaskRowsSkeleton taskCount={4} />
      ) : !loading && tasks.length === 0 ? (
        <AppText variant='body' color={colors.textSecondary} className='py-3'>
          No child tickets.
        </AppText>
      ) : isExpanded ? (
        <View style={{ maxHeight: 320 }}>
          <FlatList
            data={tasks}
            renderItem={renderTaskRow}
            keyExtractor={item => item.id}
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        </View>
      ) : (
        <FlatList
          data={visibleTasks}
          renderItem={renderTaskRow}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
