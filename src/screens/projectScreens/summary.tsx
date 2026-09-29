import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { DonutChart } from 'react-native-chart-kit/v2';
import { RootState, useAppSelector } from '../../store';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { AppText } from '../../components';
import { useTheme } from '../../theme/ThemeProvider';
import SummarySkeleton from '../../components/skeleton/summarySkeleton';
import {
  useGetProjectOverviewQuery,
  useGetUpcomingDeadlinesQuery,
} from '../../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';
import { getPriorityLabel, getPriorityThemeColor } from '../../utils/enum';
import { formatDate } from '../../utils/utils';

export const Summary: React.FC = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // 1. Redux Selectors
  const { project, projectLoading } = useAppSelector(
    (state: RootState) => state.projects,
  );

  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  // 2. RTK Query Hook
  const {
    data: overviewResponse,
    isLoading,
    refetch,
  } = useGetProjectOverviewQuery(
    projectId ? { project_id: projectId } : skipToken,
  );
  const overviewData = overviewResponse?.data;

  const {
    data: deadlinesResponse,
    isLoading: deadlinesLoading,
    refetch: refetchDeadlines,
  } = useGetUpcomingDeadlinesQuery(
    projectId ? { project_id: projectId } : skipToken,
  );
  const deadlines = deadlinesResponse?.data ?? [];

  // 3. Animation values
  const drawAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 4. Focus Effect
  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        refetch();
        refetchDeadlines();
      }

      drawAnim.setValue(0);
      fadeAnim.setValue(0);

      Animated.parallel([
        // Smooth fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Full 360-degree circular sweep draw effect
        Animated.timing(drawAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, [projectId, refetch, refetchDeadlines, drawAnim, fadeAnim]),
  );

  // 5. ALL useMemo hooks MUST be declared before any return statements
  const circleDraw = useMemo(
    () =>
      drawAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-360deg', '0deg'],
      }),
    [drawAnim],
  );

  const chartData = useMemo(
    () => [
      { status: 'To Do', value: 6, color: `${colors.secondary}75` },
      { status: 'Done', value: 4, color: `${colors.success}75` },
      { status: 'In Progress', value: 5, color: `${colors.primary}75` },
      { status: 'In Review', value: 3, color: `${colors.accentOrange}75` },
    ],
    [colors.secondary, colors.success, colors.primary, colors.accentOrange],
  );

  const chartTotal = useMemo(
    () => chartData.reduce((total, item) => total + item.value, 0),
    [chartData],
  );

  const donutTheme = useMemo(() => {
    if (colors.background === '#FFFFFF') return 'light';
    if (colors.background === '#121212') return 'dark';
    return 'system';
  }, [colors.background]);

  // 6. Early returns are placed AFTER all hooks have executed
  if (isLoading || deadlinesLoading || projectLoading) {
    return <SummarySkeleton />;
  }
  if (!overviewData) {
    return null;
  }

  const totalTasks = overviewData?.total_tasks;
  const completedTasks = overviewData?.completed;
  const updatedTasks = overviewData?.pending;
  const createdTasks = overviewData?.total_tasks;
  const dueSoonTasks = overviewData?.due_soon;

  return (
    <ScrollView
      className='flex-1'
      style={{ backgroundColor: colors.surface, paddingTop: moderateScale(20) }}
    >
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: moderateScale(100),
          gap: isSmallHeight ? layout.largeSectionGap * 3 : layout.sectionGap,
        }}
      >
        {/* Metric Cards */}
        <View
          className='flex-row flex-wrap justify-between'
          style={{ gap: moderateScale(12) }}
        >
          <View
            className='w-[48%] justify-between'
            style={{
              padding: moderateScale(12),
              backgroundColor: colors.background,
              borderRadius: Radius.lg,
              gap: layout.mediumGap,
            }}
          >
            <View
              className='items-center justify-center'
              style={{
                width: moderateScale(34),
                height: moderateScale(34),
                backgroundColor: `${colors.success}20`,
                borderRadius: Radius.sm,
              }}
            >
              <Ionicons
                name='checkmark-sharp'
                size={moderateScale(18)}
                color={colors.success}
              />
            </View>
            <AppText
              variant='body'
              className='font-semibold'
              color={colors.text}
              style={{ color: colors.success }}
            >
              {completedTasks} completed
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              in the last 7 days
            </AppText>
          </View>

          <View
            className='w-[48%] justify-between'
            style={{
              padding: moderateScale(12),
              backgroundColor: colors.background,
              borderRadius: Radius.lg,
              gap: layout.mediumGap,
            }}
          >
            <View
              className='items-center justify-center'
              style={{
                width: moderateScale(34),
                height: moderateScale(34),
                backgroundColor: `${colors.primary}20`,
                borderRadius: Radius.sm,
              }}
            >
              <Ionicons
                name='pencil-sharp'
                size={moderateScale(15)}
                color={colors.primary}
              />
            </View>
            <AppText
              variant='body'
              className='font-semibold'
              color={colors.text}
              style={{ color: colors.primary }}
            >
              {updatedTasks} updated
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              in the last 7 days
            </AppText>
          </View>

          <View
            className='w-[48%] justify-between'
            style={{
              padding: moderateScale(12),
              backgroundColor: colors.background,
              borderRadius: Radius.lg,
              gap: layout.mediumGap,
            }}
          >
            <View
              className='items-center justify-center'
              style={{
                width: moderateScale(34),
                height: moderateScale(34),
                backgroundColor: `${colors.accentPurple}20`,
                borderRadius: Radius.sm,
              }}
            >
              <Ionicons
                name='add-outline'
                size={moderateScale(20)}
                color={colors.accentPurple}
              />
            </View>
            <AppText
              variant='body'
              className='font-semibold'
              color={colors.text}
              style={{ color: colors.accentPurple }}
            >
              {createdTasks} created
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              in the last 7 days
            </AppText>
          </View>

          <View
            className='w-[48%] justify-between'
            style={{
              padding: moderateScale(12),
              backgroundColor: colors.background,
              borderRadius: Radius.lg,
              gap: layout.mediumGap,
            }}
          >
            <View
              className='items-center justify-center'
              style={{
                width: moderateScale(34),
                height: moderateScale(34),
                backgroundColor: `${colors.textSecondary}20`,
                borderRadius: Radius.sm,
              }}
            >
              <Ionicons
                name='calendar-outline'
                size={moderateScale(15)}
                color={colors.textSecondary}
              />
            </View>
            <AppText
              variant='body'
              className='font-semibold'
              color={colors.text}
              style={{ color: colors.error }}
            >
              {dueSoonTasks} due soon
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              in the next 7 days
            </AppText>
          </View>
        </View>

        {/* Status Overview Card */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
            padding: moderateScale(20),
          }}
        >
          <AppText
            variant='bodyLarge'
            className='font-bold'
            color={colors.text}
          >
            Status overview
          </AppText>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            style={{ paddingBottom: moderateScale(10) }}
          >
            in the last 14 days
          </AppText>

          {/* Donut Chart Container with Center Label Absolute Positioning */}
          <View className='relative items-center justify-center'>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ rotate: circleDraw }],
              }}
            >
              <DonutChart
                data={chartData}
                valueKey='value'
                labelKey='status'
                colorKey='color'
                width={moderateScale(300)}
                height={moderateScale(260)}
                legend={false}
                innerRadius={moderateScale(75)}
                theme={donutTheme}
              />
            </Animated.View>

            {/* Stationary Center Label */}
            <View
              className='absolute items-center justify-center'
              pointerEvents='none'
            >
              <AppText
                variant='bodyLarge'
                className='font-semibold'
                style={{
                  fontSize: moderateScale(22),
                  color: colors.textSecondary,
                }}
              >
                {chartTotal || totalTasks}
              </AppText>
              <AppText
                variant='body'
                style={{
                  fontSize: moderateScale(13),
                  color: colors.textSecondary,
                  marginTop: moderateScale(2),
                }}
              >
                Total Task Count
              </AppText>
            </View>
          </View>

          {/* Status Items List */}
          {chartData.map(item => (
            <TouchableOpacity
              key={item.status}
              activeOpacity={0.7}
              className='flex-row items-center justify-between'
              style={{ paddingVertical: moderateScale(10) }}
            >
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <View
                  style={{
                    backgroundColor: item.color,
                    width: moderateScale(10),
                    height: moderateScale(10),
                    borderRadius: Radius.circle,
                  }}
                />

                <AppText
                  variant='caption'
                  className='font-medium'
                  color={colors.text}
                >
                  {item.status}
                </AppText>
              </View>
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <AppText
                  variant='caption'
                  className='font-semibold'
                  color={colors.text}
                >
                  {item.value}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Deadlines */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
            paddingHorizontal: moderateScale(16),
            paddingTop: moderateScale(14),
            paddingBottom: moderateScale(6),
          }}
        >
          <View className='mb-2 flex-row items-center justify-between'>
            <AppText
              variant='bodyLarge'
              className='font-bold'
              color={colors.text}
            >
              Upcoming deadlines
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UpcomingDeadlines')}
              className='flex-row items-center'
              style={{ gap: moderateScale(3) }}
            >
              <AppText
                variant='caption'
                className='font-semibold'
                style={{ color: colors.primary }}
              >
                View more
              </AppText>
              <Ionicons
                name='chevron-forward'
                size={moderateScale(13)}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {deadlines.length ? (
            deadlines.slice(0, 4).map((deadline, index) => {
              const label = getPriorityLabel(deadline.priority);
              const priorityColor = getPriorityThemeColor(
                deadline.priority,
                colors,
              );
              const overdue =
                deadline.deadline_status?.toLowerCase() === 'overdue';

              return (
                <View
                  key={deadline.id}
                  style={{
                    borderTopWidth: index ? 1 : 0,
                    borderTopColor: colors.border,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() =>
                      navigation.navigate('issue', {
                        projectId: deadline.project_id,
                        taskId: deadline.task_id,
                        taskName: deadline.title,
                      })
                    }
                    className='flex-row items-center'
                    style={{
                      minHeight: moderateScale(64),
                      paddingVertical: moderateScale(10),
                      gap: moderateScale(10),
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
                        style={{
                          color: priorityColor,
                          fontSize: moderateScale(11),
                        }}
                      >
                        {label}
                      </AppText>
                    </View>

                    {/* Task Title & Project / Sprint Info */}
                    <View className='flex-1' style={{ gap: moderateScale(3) }}>
                      <AppText
                        variant='body'
                        color={colors.text}
                        numberOfLines={1}
                        className='font-medium'
                      >
                        {deadline.title}
                      </AppText>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        numberOfLines={1}
                      >
                        {deadline.task_key || (deadline as any)?.key}
                        {deadline.sprint_name
                          ? ` - ${deadline.sprint_name}`
                          : ''}
                        {!deadline.sprint_name && deadline.project_name
                          ? ` - ${deadline.project_name}`
                          : ''}
                      </AppText>
                    </View>

                    {/* Due Date / Overdue Status */}
                    <AppText
                      variant='caption'
                      style={{
                        color: overdue ? colors.error : colors.textSecondary,
                        fontSize: moderateScale(11),
                        width: moderateScale(70),
                      }}
                    >
                      {overdue ? 'Overdue' : formatDate(deadline.due_date)}
                    </AppText>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{ paddingVertical: moderateScale(14) }}
            >
              No upcoming deadlines.
            </AppText>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Summary;
