import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { AppText } from '../index';
import { TeamWorkloadMember } from '../../types/project.type';

interface TeamWorkloadChartProps {
  data: TeamWorkloadMember[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 4;

export const TeamWorkloadChart: React.FC<TeamWorkloadChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const layout = useAuthLayout();
  const moderateScale = layout?.moderateScale || ((size: number) => size);

  const [currentPage, setCurrentPage] = useState(1);

  const workloadList = Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Math.ceil(workloadList.length / ITEMS_PER_PAGE));

  const pageMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return workloadList.slice(start, start + ITEMS_PER_PAGE);
  }, [workloadList, currentPage]);

  // Determine maximum scale for grid ticks (default to 10 if all 0 or empty)
  const maxDataValue = useMemo(() => {
    if (workloadList.length === 0) return 10;
    const maxVal = Math.max(
      ...workloadList.map(m =>
        Math.max(
          m.tasks_count ?? m.total_tasks ?? m.tasks ?? 0,
          m.story_points ?? m.total_points ?? m.points ?? 0,
          0,
        ),
      ),
    );
    if (maxVal <= 10) return 10;
    return Math.ceil(maxVal / 5) * 5;
  }, [workloadList]);

  const ticks = useMemo(() => {
    const step = maxDataValue / 5;
    return [0, step, step * 2, step * 3, step * 4, maxDataValue].map(v =>
      Math.round(v),
    );
  }, [maxDataValue]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const isEmpty = workloadList.length === 0;

  return (
    <View
      className='mb-4 shadow-sm'
      style={{
        padding: moderateScale(16),
        backgroundColor: colors?.surface,
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: colors?.border,
      }}
    >
      {/* Header with Title & Pagination */}
      <View className='mb-4 flex-row items-center justify-between'>
        <View className='flex-1'>
          <AppText
            variant='title'
            className='font-bold'
            style={{ color: colors?.text, fontSize: moderateScale(16) }}
          >
            Team Workload
          </AppText>
          <AppText
            variant='caption'
            className='mt-0.5'
            style={{ color: colors?.textSecondary }}
          >
            Assigned tasks vs points by team member
          </AppText>
        </View>

        {/* Pagination Arrows */}
        <View className='flex-row items-center rounded-lg border px-2 py-1' style={{ borderColor: colors?.border }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handlePrevPage}
            disabled={currentPage <= 1}
            className='p-1'
          >
            <Ionicons
              name='chevron-back'
              size={moderateScale(14)}
              color={currentPage <= 1 ? colors?.border : colors?.text}
            />
          </TouchableOpacity>

          <AppText
            variant='caption'
            className='mx-2 font-medium'
            style={{ color: colors?.textSecondary }}
          >
            {currentPage}/{totalPages}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleNextPage}
            disabled={currentPage >= totalPages}
            className='p-1'
          >
            <Ionicons
              name='chevron-forward'
              size={moderateScale(14)}
              color={currentPage >= totalPages ? colors?.border : colors?.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chart Content */}
      <View className='my-2 flex-row' style={{ minHeight: moderateScale(180) }}>
        {/* Left Y-Axis: Member Avatars & Info */}
        <View style={{ width: moderateScale(95), justifyContent: 'space-around', paddingRight: 8 }}>
          {isEmpty ? (
            // 4 Placeholder member rows when no data (matching screenshot)
            [1, 2, 3, 4].map(idx => (
              <View key={idx} className='flex-row items-center my-1'>
                <View
                  style={{
                    width: moderateScale(22),
                    height: moderateScale(22),
                    borderRadius: moderateScale(11),
                    backgroundColor: '#E5E7EB',
                    marginRight: 6,
                  }}
                />
                <View
                  style={{
                    width: moderateScale(42),
                    height: moderateScale(12),
                    borderRadius: moderateScale(4),
                    backgroundColor: '#E5E7EB',
                  }}
                />
              </View>
            ))
          ) : (
            pageMembers.map((member, idx) => {
              const name =
                member.name ||
                member.user_name ||
                member.username ||
                `User ${idx + 1}`;
              const initials = name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <View key={member.id || member.user_id || idx} className='flex-row items-center my-1.5'>
                  <View
                    className='items-center justify-center'
                    style={{
                      width: moderateScale(24),
                      height: moderateScale(24),
                      borderRadius: moderateScale(12),
                      backgroundColor: colors?.primary || '#3B82F6',
                      marginRight: 6,
                    }}
                  >
                    <AppText
                      style={{
                        color: colors?.white || '#FFFFFF',
                        fontSize: moderateScale(9),
                        fontWeight: '700',
                      }}
                    >
                      {initials}
                    </AppText>
                  </View>
                  <AppText
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    variant='caption'
                    className='flex-1 font-semibold'
                    style={{ color: colors?.text, fontSize: moderateScale(11) }}
                  >
                    {name}
                  </AppText>
                </View>
              );
            })
          )}
        </View>

        {/* Right Area: Chart Canvas with Vertical Grid Ticks */}
        <View className='flex-1 justify-between'>
          {/* Vertical Grid Lines and Bars Area */}
          <View className='flex-1 justify-around relative'>
            {/* Background Vertical Grid Lines */}
            <View className='absolute inset-0 flex-row justify-between'>
              {ticks.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 1,
                    height: '100%',
                    backgroundColor: colors?.border || '#F3F4F6',
                  }}
                />
              ))}
            </View>

            {/* If Empty, show centered message over grid */}
            {isEmpty ? (
              <View className='flex-1 items-center justify-center'>
                <AppText
                  variant='caption'
                  className='font-medium'
                  style={{ color: colors?.textSecondary || '#9CA3AF' }}
                >
                  No workload data available
                </AppText>
              </View>
            ) : (
              /* If Data exists, render horizontal paired bars for each member */
              pageMembers.map((member, idx) => {
                const tasks =
                  member.tasks_count ??
                  member.total_tasks ??
                  member.tasks ??
                  0;
                const points =
                  member.story_points ??
                  member.total_points ??
                  member.points ??
                  0;

                const taskWidthPct = `${Math.min(
                  100,
                  (tasks / maxDataValue) * 100,
                )}%`;
                const pointsWidthPct = `${Math.min(
                  100,
                  (points / maxDataValue) * 100,
                )}%`;

                return (
                  <View key={member.id || member.user_id || idx} className='my-1.5 justify-center'>
                    {/* Tasks Bar (Light grey/slate) */}
                    <View className='flex-row items-center mb-1'>
                      <View
                        style={{
                          width: taskWidthPct as any,
                          height: moderateScale(7),
                          backgroundColor: '#CBD5E1',
                          borderRadius: moderateScale(3),
                          minWidth: tasks > 0 ? moderateScale(6) : 0,
                        }}
                      />
                      {tasks > 0 && (
                        <AppText
                          variant='caption'
                          style={{
                            marginLeft: 4,
                            fontSize: moderateScale(9),
                            color: colors?.textSecondary,
                          }}
                        >
                          {tasks}
                        </AppText>
                      )}
                    </View>

                    {/* Points Bar (Blue) */}
                    <View className='flex-row items-center'>
                      <View
                        style={{
                          width: pointsWidthPct as any,
                          height: moderateScale(7),
                          backgroundColor: colors?.primary || '#3B82F6',
                          borderRadius: moderateScale(3),
                          minWidth: points > 0 ? moderateScale(6) : 0,
                        }}
                      />
                      {points > 0 && (
                        <AppText
                          variant='caption'
                          style={{
                            marginLeft: 4,
                            fontSize: moderateScale(9),
                            color: colors?.primary,
                            fontWeight: '600',
                          }}
                        >
                          {points}
                        </AppText>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* X-Axis Numbers / Ticks */}
          <View className='flex-row justify-between pt-2'>
            {ticks.map(tick => (
              <AppText
                key={tick}
                variant='caption'
                style={{
                  color: colors?.textSecondary || '#9CA3AF',
                  fontSize: moderateScale(10),
                }}
              >
                {tick}
              </AppText>
            ))}
          </View>
        </View>
      </View>

      {/* Footer Legend matching screenshot: ■ Tasks  ■ Points */}
      <View className='mt-3 flex-row items-center justify-center'>
        <View className='mr-6 flex-row items-center'>
          <View
            style={{
              width: moderateScale(12),
              height: moderateScale(12),
              backgroundColor: '#CBD5E1',
              borderRadius: moderateScale(2),
              marginRight: 6,
            }}
          />
          <AppText
            variant='caption'
            className='font-medium'
            style={{ color: colors?.textSecondary }}
          >
            Tasks
          </AppText>
        </View>

        <View className='flex-row items-center'>
          <View
            style={{
              width: moderateScale(12),
              height: moderateScale(12),
              backgroundColor: colors?.primary || '#3B82F6',
              borderRadius: moderateScale(2),
              marginRight: 6,
            }}
          />
          <AppText
            variant='caption'
            className='font-medium'
            style={{ color: colors?.textSecondary }}
          >
            Points
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default TeamWorkloadChart;
