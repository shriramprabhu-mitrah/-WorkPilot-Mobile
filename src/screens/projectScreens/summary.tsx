import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { DonutChart } from 'react-native-chart-kit/v2';
import { RootState, useAppSelector } from '../../store';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { AppText } from '../../components';
import Screen from '../../components/common/ScreenWapper';
import { useTheme } from '../../theme/ThemeProvider';

export const Summary: React.FC = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  const { project } = useAppSelector((state: RootState) => state?.projects);

  const totalTasks = project?.metrics?.total_tasks;
  const completedTasks = project?.metrics?.completed_tasks;
  const updatedTasks = 0;
  const createdTasks = 0;
  const dueSoonTasks = 0;

  const chartData = [
    { status: 'To Do', value: 6, color: `${colors.secondary}75` },
    { status: 'Done', value: 4, color: `${colors.success}75` },
    { status: 'In Progress', value: 5, color: `${colors.primary}75` },
    { status: 'In Review', value: 3, color: `${colors.accentOrange}75` },
  ];

  const chartTotal = chartData.reduce((total, item) => total + item.value, 0);

  return (
    <Screen scroll={true} backgroundColor={colors.surface}>
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: moderateScale(100),
          gap: isSmallHeight ? layout.largeSectionGap * 3 : layout.sectionGap,
        }}
      >
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
              in the last 7 days 🎉
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

          <View className='items-center justify-center'>
            <DonutChart
              data={chartData}
              valueKey='value'
              labelKey='status'
              colorKey='color'
              width={moderateScale(300)}
              height={moderateScale(260)}
              legend={false}
              innerRadius={moderateScale(75)}
              centerLabel={
                <View
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <AppText
                    variant='bodyLarge'
                    className='font-semibold'
                    style={{
                      fontSize: moderateScale(22),
                      color: colors.text,
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
              }
            />
          </View>

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

                <Ionicons
                  name='chevron-forward'
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Screen>
  );
};

export default Summary;
