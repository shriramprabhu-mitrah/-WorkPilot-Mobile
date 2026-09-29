import React, { useCallback, useRef } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { RootStackParamList } from '../types/navigationTypes';
import { RootState, useAppSelector } from '../store';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useGetUpcomingDeadlinesQuery } from '../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { UpcomingDeadline } from '../types/project.type';
import { Radius } from '../constants/Radius';
import { formatDate } from '../utils/utils';
import { getPriorityLabel, getPriorityThemeColor } from '../utils/enum';

const UpcomingDeadlines = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { project, projectLoading } = useAppSelector(
    (state: RootState) => state.projects,
  );
  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  const {
    data: deadlinesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetUpcomingDeadlinesQuery(
    projectId ? { project_id: projectId } : skipToken,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const deadlines = deadlinesResponse?.data ?? [];

  // Track if this is the initial screen mount so we don't double-call on first load
  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      if (projectId) {
        refetch();
      }
    }, [projectId, refetch]),
  );

  const renderDeadline = useCallback(
    ({ item }: { item: UpcomingDeadline }) => {
      // Reusable priority helpers
      const label = getPriorityLabel(item.priority);
      const priorityColor = getPriorityThemeColor(item.priority, colors);
      const overdue = item.deadline_status?.toLowerCase() === 'overdue';

      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('issue', {
              projectId: item.project_id,
              taskId: item.task_id,
              taskName: item.title,
            })
          }
          className='flex-row items-center'
          style={{
            minHeight: moderateScale(64),
            paddingVertical: moderateScale(10),
            paddingHorizontal: moderateScale(12),
            marginBottom: layout.elementGap,
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: Radius.md,
            gap: moderateScale(12),
          }}
        >
          {/* Priority Badge */}
          <View
            className='flex-row items-center'
            style={{
              width: moderateScale(70),
              paddingHorizontal: moderateScale(9),
              paddingVertical: moderateScale(5),
              borderRadius: Radius.circle,
              backgroundColor: `${priorityColor}12`,
              gap: moderateScale(4),
            }}
          >
            <Ionicons
              name='flag-outline'
              size={moderateScale(12)}
              color={priorityColor}
            />
            <AppText
              variant='caption'
              style={{ color: priorityColor, fontSize: moderateScale(11) }}
            >
              {label}
            </AppText>
          </View>

          {/* Task Info */}
          <View className='flex-1' style={{ gap: moderateScale(3) }}>
            <AppText
              variant='body'
              color={colors.text}
              numberOfLines={1}
              className='font-medium'
            >
              {item.title}
            </AppText>
            <AppText
              variant='caption'
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {item.task_key || (item as any)?.key}
              {!item.sprint_name && item.project_name
                ? ` - ${item.project_name}`
                : ''}
            </AppText>
            <AppText
              variant='caption'
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {item.sprint_name === null || item.sprint_name === ''
                ? 'No Sprint'
                : item.sprint_name}
            </AppText>
          </View>

          {/* Due Date / Status */}
          <AppText
            variant='caption'
            style={{
              color: overdue ? colors.error : colors.textSecondary,
              fontSize: moderateScale(11),
              width: moderateScale(70),
            }}
          >
            {overdue ? 'Overdue' : formatDate(item.due_date)}
          </AppText>
        </TouchableOpacity>
      );
    },
    [colors, layout.elementGap, moderateScale, navigation],
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title='Upcoming Deadlines'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
      />

      {isLoading || projectLoading ? (
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: 12,
          }}
        >
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap }}
            renderItem={() => <ProjectCardSkeleton />}
          />
        </View>
      ) : isError ? (
        <View className='flex-1 items-center justify-center px-6'>
          <AppText variant='body' color={colors.textSecondary}>
            Could not load upcoming deadlines.
          </AppText>
          <TouchableOpacity
            onPress={() => refetch()}
            className='mt-3 px-4 py-2'
          >
            <AppText variant='body' style={{ color: colors.primary }}>
              Try again
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={deadlines}
          keyExtractor={(item, index) => item.id || `deadline-${index}`}
          renderItem={renderDeadline}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: 12,
            paddingBottom: hp(16),
            flexGrow: deadlines.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center py-16'>
              <AppText variant='body' color={colors.textSecondary}>
                No upcoming deadlines.
              </AppText>
            </View>
          }
        />
      )}
    </Screen>
  );
};

export default UpcomingDeadlines;
