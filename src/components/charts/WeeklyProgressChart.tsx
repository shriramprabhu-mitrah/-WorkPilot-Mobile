import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { AppText } from '../index';
import { WeeklyProgressDayItem } from '../../types/project.type';

interface WeeklyProgressChartProps {
  data: WeeklyProgressDayItem[];
  isLoading?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  data = [],
  isLoading = false,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { colors } = useTheme();
  const layout = useAuthLayout();
  const moderateScale = layout?.moderateScale || ((size: number) => size);

  const [dateModalType, setDateModalType] = useState<'start' | 'end' | null>(
    null,
  );

  const rawList = Array.isArray(data) ? data : [];

  // Aggregate by weekday (Mon - Sun)
  const chartDays = useMemo(() => {
    // If empty or all 0, ensure all 7 days exist
    const dayMap: Record<string, { planned: number; completed: number }> = {
      Mon: { planned: 0, completed: 0 },
      Tue: { planned: 0, completed: 0 },
      Wed: { planned: 0, completed: 0 },
      Thu: { planned: 0, completed: 0 },
      Fri: { planned: 0, completed: 0 },
      Sat: { planned: 0, completed: 0 },
      Sun: { planned: 0, completed: 0 },
    };

    rawList.forEach(item => {
      if (!item || !item.day) return;
      // Match day string (e.g., "Mon", "Monday", "2026-09-01")
      const dayKey = WEEKDAYS.find(w =>
        item.day.toLowerCase().startsWith(w.toLowerCase()),
      );
      if (dayKey && dayMap[dayKey]) {
        dayMap[dayKey].planned += Number(item.planned || 0);
        dayMap[dayKey].completed += Number(item.completed || 0);
      }
    });

    return WEEKDAYS.map(day => ({
      day,
      planned: dayMap[day].planned,
      completed: dayMap[day].completed,
    }));
  }, [rawList]);

  // Determine Y-axis max scale
  const maxY = useMemo(() => {
    const maxVal = Math.max(
      ...chartDays.map(d => Math.max(d.planned, d.completed, 0)),
    );
    if (maxVal === 0) return 60;
    if (maxVal <= 60) return 60;
    return Math.ceil(maxVal / 20) * 20;
  }, [chartDays]);

  const yTicks = useMemo(() => {
    const step = maxY / 4;
    return [maxY, step * 3, step * 2, step, 0].map(v => Math.round(v));
  }, [maxY]);

  const chartHeight = moderateScale(140);
  const barWidth = moderateScale(10);
  const barGap = moderateScale(3);

  const handleDaySelect = (day: { dateString: string }) => {
    if (dateModalType === 'start') {
      onStartDateChange?.(day.dateString);
    } else if (dateModalType === 'end') {
      onEndDateChange?.(day.dateString);
    }
    setDateModalType(null);
  };

  const activeDateValue = dateModalType === 'start' ? startDate : endDate;

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
      {/* Header */}
      <View className='mb-3 flex-row items-start justify-between'>
        <View className='flex-1 mr-2'>
          <AppText
            variant='title'
            className='font-bold'
            style={{ color: colors?.text, fontSize: moderateScale(16) }}
          >
            Weekly Progress
          </AppText>
          <AppText
            variant='caption'
            className='mt-0.5'
            style={{ color: colors?.textSecondary }}
          >
            Planned vs completed tasks by weekday
          </AppText>
        </View>

        {/* Date Selectors */}
        {(startDate !== undefined || endDate !== undefined) && (
          <View className='flex-row items-center space-x-1.5'>
            {/* Start Date Chip */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDateModalType('start')}
              className='flex-row items-center rounded-lg border px-2 py-1 mr-1'
              style={{
                borderColor: colors?.border,
                backgroundColor: colors?.surface,
              }}
            >
              <Ionicons
                name='calendar-outline'
                size={moderateScale(12)}
                color={colors?.primary}
                style={{ marginRight: 4 }}
              />
              <AppText
                variant='caption'
                style={{
                  color: colors?.text,
                  fontSize: moderateScale(10),
                  fontWeight: '500',
                }}
              >
                {startDate || 'Start'}
              </AppText>
            </TouchableOpacity>

            {/* End Date Chip */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDateModalType('end')}
              className='flex-row items-center rounded-lg border px-2 py-1'
              style={{
                borderColor: colors?.border,
                backgroundColor: colors?.surface,
              }}
            >
              <Ionicons
                name='calendar-outline'
                size={moderateScale(12)}
                color={colors?.primary}
                style={{ marginRight: 4 }}
              />
              <AppText
                variant='caption'
                style={{
                  color: colors?.text,
                  fontSize: moderateScale(10),
                  fontWeight: '500',
                }}
              >
                {endDate || 'End'}
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Chart Area with Y-axis & Bars */}
      <View
        className='my-2 flex-row'
        style={{ height: chartHeight + moderateScale(30) }}
      >
        {/* Y-Axis Ticks */}
        <View
          style={{
            width: moderateScale(28),
            height: chartHeight,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingRight: 6,
          }}
        >
          {yTicks.map(tick => (
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

        {/* Chart Canvas & Grid */}
        <View className='flex-1 justify-between'>
          {/* Grid lines and vertical bars */}
          <View style={{ height: chartHeight, position: 'relative' }}>
            {/* Horizontal Grid Lines */}
            <View className='absolute inset-0 justify-between'>
              {yTicks.map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: colors?.border || '#F3F4F6',
                  }}
                />
              ))}
            </View>

            {/* Bars container aligned to bottom */}
            <View className='flex-1 flex-row items-end justify-around px-1'>
              {chartDays.map((item, idx) => {
                const plannedHeight =
                  maxY > 0 ? (item.planned / maxY) * chartHeight : 0;
                const completedHeight =
                  maxY > 0 ? (item.completed / maxY) * chartHeight : 0;

                return (
                  <View key={idx} className='items-center'>
                    {/* Paired Vertical Bars */}
                    <View className='flex-row items-end'>
                      {/* Planned Bar (Lavender / Light Blue) */}
                      <View
                        style={{
                          width: barWidth,
                          height: Math.max(
                            item.planned > 0 ? moderateScale(4) : 0,
                            plannedHeight,
                          ),
                          backgroundColor: '#C7D2FE',
                          borderTopLeftRadius: moderateScale(3),
                          borderTopRightRadius: moderateScale(3),
                          marginRight: barGap,
                        }}
                      />

                      {/* Completed Bar (Vibrant Blue) */}
                      <View
                        style={{
                          width: barWidth,
                          height: Math.max(
                            item.completed > 0 ? moderateScale(4) : 0,
                            completedHeight,
                          ),
                          backgroundColor: colors?.primary || '#2563EB',
                          borderTopLeftRadius: moderateScale(3),
                          borderTopRightRadius: moderateScale(3),
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* X-Axis Weekday Labels */}
          <View className='flex-row justify-around pt-2 px-1'>
            {chartDays.map((item, idx) => (
              <AppText
                key={idx}
                variant='caption'
                className='font-medium'
                style={{
                  color: colors?.textSecondary || '#9CA3AF',
                  fontSize: moderateScale(10),
                  textAlign: 'center',
                  width: (barWidth + barGap) * 2 + moderateScale(8),
                }}
              >
                {item.day}
              </AppText>
            ))}
          </View>
        </View>
      </View>

      {/* Legend: ■ Planned  ■ Completed */}
      <View className='mt-3 flex-row items-center justify-center'>
        <View className='mr-6 flex-row items-center'>
          <View
            style={{
              width: moderateScale(12),
              height: moderateScale(12),
              backgroundColor: '#C7D2FE',
              borderRadius: moderateScale(2),
              marginRight: 6,
            }}
          />
          <AppText
            variant='caption'
            className='font-medium'
            style={{ color: colors?.textSecondary }}
          >
            Planned
          </AppText>
        </View>

        <View className='flex-row items-center'>
          <View
            style={{
              width: moderateScale(12),
              height: moderateScale(12),
              backgroundColor: colors?.primary || '#2563EB',
              borderRadius: moderateScale(2),
              marginRight: 6,
            }}
          />
          <AppText
            variant='caption'
            className='font-medium'
            style={{ color: colors?.textSecondary }}
          >
            Completed
          </AppText>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalType !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setDateModalType(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: moderateScale(16),
          }}
          onPress={() => setDateModalType(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: '100%',
              maxWidth: 360,
              backgroundColor: colors?.surface || '#FFFFFF',
              borderRadius: moderateScale(16),
              padding: moderateScale(16),
              borderWidth: 1,
              borderColor: colors?.border || '#E5E7EB',
            }}
          >
            {/* Modal Header */}
            <View className='mb-3 flex-row items-center justify-between'>
              <AppText
                variant='title'
                className='font-bold'
                style={{ color: colors?.text }}
              >
                Select {dateModalType === 'start' ? 'Start Date' : 'End Date'}
              </AppText>
              <TouchableOpacity
                onPress={() => setDateModalType(null)}
                className='p-1'
              >
                <Ionicons
                  name='close'
                  size={moderateScale(20)}
                  color={colors?.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <Calendar
              current={activeDateValue}
              markedDates={
                activeDateValue
                  ? {
                      [activeDateValue]: {
                        selected: true,
                        selectedColor: colors?.primary || '#3B82F6',
                      },
                    }
                  : {}
              }
              onDayPress={handleDaySelect}
              theme={{
                backgroundColor: colors?.surface || '#FFFFFF',
                calendarBackground: colors?.surface || '#FFFFFF',
                textSectionTitleColor: colors?.textSecondary || '#9CA3AF',
                selectedDayBackgroundColor: colors?.primary || '#3B82F6',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: colors?.primary || '#3B82F6',
                dayTextColor: colors?.text || '#1F2937',
                textDisabledColor: colors?.border || '#E5E7EB',
                monthTextColor: colors?.text || '#1F2937',
                arrowColor: colors?.primary || '#3B82F6',
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default WeeklyProgressChart;
