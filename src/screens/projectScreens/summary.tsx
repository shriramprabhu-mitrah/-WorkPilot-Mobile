import React, { useCallback, useRef, useEffect } from 'react';
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

export const Summary: React.FC = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();
  const { project, loading } = useAppSelector(
    (state: RootState) => state?.projects,
  );

  // Animation values
  const drawAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Track project changes and initial mount state
  const lastProjectIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  const currentProjectId =
    project?.id?.toString() || (project as any)?._id?.toString() || null;

  // Update tracking refs once project finishes loading
  useEffect(() => {
    if (project && !loading && currentProjectId) {
      lastProjectIdRef.current = currentProjectId;
      isInitialMountRef.current = false;
    }
  }, [project, loading, currentProjectId]);

  // Determine whether to show skeleton (Only on 1st load OR when project changes)
  const isProjectChanged = currentProjectId !== lastProjectIdRef.current;
  const shouldShowSkeleton =
    !project || (loading && (isInitialMountRef.current || isProjectChanged));

  // Re-run animation whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading && project) {
        // Reset animation states on focus
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
      }
    }, [loading, project, drawAnim, fadeAnim]),
  );

  // Interpolate rotation from -360deg to 0deg for "circle drawing" effect
  const circleDraw = drawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-360deg', '0deg'],
  });

  if (shouldShowSkeleton) {
    return <SummarySkeleton />;
  }

  const totalTasks = project?.metrics?.total_tasks;
  const completedTasks = project?.metrics?.completed_tasks;
  const updatedTasks = project?.metrics?.pending_tasks;
  const createdTasks = project?.metrics?.total_tasks;
  const dueSoonTasks = project?.metrics?.overdue_tasks;

  const chartData = [
    { status: 'To Do', value: 6, color: `${colors.secondary}75` },
    { status: 'Done', value: 4, color: `${colors.success}75` },
    { status: 'In Progress', value: 5, color: `${colors.primary}75` },
    { status: 'In Review', value: 3, color: `${colors.accentOrange}75` },
  ];

  const chartTotal = chartData.reduce((total, item) => total + item.value, 0);

  const donutTheme =
    colors.background === '#FFFFFF'
      ? 'light'
      : colors.background === '#121212'
        ? 'dark'
        : 'system';

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
      </View>
    </ScrollView>
  );
};

export default Summary;
