import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { RootState, useAppDispatch, useAppSelector } from '../../store';
import { moderateScale } from '../../utils/responsive';
import { AppText } from '../../components';

export interface TaskItem {
  id: string;
  key: string;
  title: string;
  status: string;
  dueDate: string;
  priority?: string;
  type?: string;
  assignee?: string;
}

export const Calendar: React.FC = () => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const dispatch = useAppDispatch();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-${dd}`;
  });

  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const [activeYear, activeMonth] = useMemo(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return [y, m];
  }, [selectedDate]);

  const [modalYear, setModalYear] = useState<number>(activeYear);

  const { tasks } = useAppSelector((state: RootState) => state.projects || {});

  const todayStr = useMemo(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mm}-${dd}`;
  }, []);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    (tasks || []).forEach((t: TaskItem) => {
      if (t?.dueDate) {
        marks[t.dueDate] = {
          marked: true,
          dotColor: colors.primary,
        };
      }
    });

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.white,
      dotColor: colors.white,
    };

    return marks;
  }, [tasks, selectedDate, colors]);

  const filteredTasksForSelectedDate = useMemo(() => {
    return (tasks || []).filter((t: TaskItem) => t?.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (monthData: DateData) => {
    setSelectedDate(monthData.dateString);
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  const handleOpenPicker = () => {
    setModalYear(activeYear);
    setIsPickerVisible(true);
  };

  const handleSelectMonthFromPicker = (zeroBasedIndex: number) => {
    const targetMonth = String(zeroBasedIndex + 1).padStart(2, '0');
    const targetDay = String(selectedDate.split('-')[2] || '01').padStart(
      2,
      '0',
    );

    setSelectedDate(`${modalYear}-${targetMonth}-${targetDay}`);
    setIsPickerVisible(false);
  };

  return (
    <View className='flex-1' style={{ backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='py-3'
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          gap: moderateScale(10),
        }}
      >
        {['Status', 'Assignee', 'Priority', 'Type'].map(filterName => (
          <TouchableOpacity
            key={filterName}
            activeOpacity={0.7}
            className='flex-row items-center justify-between rounded-xl border'
            style={{
              paddingHorizontal: moderateScale(10),
              backgroundColor: colors.surface,
              borderColor: colors.border,
              gap: layout.mediumGap,
            }}
          >
            <AppText variant='body' className='font-medium' color={colors.text}>
              {filterName}
            </AppText>
            <Ionicons
              name='chevron-down-outline'
              size={moderateScale(14)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: moderateScale(40),
        }}
      >
        <View
          className='overflow-hidden rounded-3xl p-2 shadow-sm'
          style={{ backgroundColor: colors.surface }}
        >
          <View className='mb-2 flex-row items-center justify-between px-3 pt-2'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenPicker}
              className='flex-row items-center gap-1.5 rounded-lg px-2 py-1'
              style={{ backgroundColor: colors.background }}
            >
              <AppText
                variant='body'
                className='font-bold'
                style={{ fontSize: moderateScale(16), color: colors.text }}
              >
                {new Date(activeYear, activeMonth - 1).toLocaleString(
                  'default',
                  {
                    month: 'long',
                  },
                )}{' '}
                {activeYear}
              </AppText>
              <Ionicons
                name='caret-down-sharp'
                size={moderateScale(12)}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoToday}>
              <AppText
                className='font-bold'
                style={{ fontSize: moderateScale(14), color: colors.primary }}
              >
                Today
              </AppText>
            </TouchableOpacity>
          </View>

          <RNCalendar
            key={selectedDate}
            current={selectedDate}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            hideExtraDays={false}
            enableSwipeMonths={true}
            renderHeader={() => null}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.placeholder || '#C4C4C4',
              dotColor: colors.primary,
              selectedDotColor: colors.white,
              arrowColor: colors.text,
              monthTextColor: colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: moderateScale(14),
              textMonthFontSize: moderateScale(16),
              textDayHeaderFontSize: moderateScale(13),
            }}
          />
        </View>

        <View className='mt-4'>
          {filteredTasksForSelectedDate.length > 0 ? (
            filteredTasksForSelectedDate.map((task: any) => (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.8}
                className='mb-2.5 flex-row items-center justify-between rounded-2xl border p-4'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View className='flex-row items-center gap-3'>
                  <View
                    className='items-center justify-center rounded-lg border'
                    style={{
                      width: moderateScale(28),
                      height: moderateScale(28),
                      borderColor: colors.primary,
                      backgroundColor: '#E8F1FF',
                    }}
                  >
                    <Ionicons
                      name='checkbox-outline'
                      size={moderateScale(16)}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <AppText
                      variant='body'
                      className='font-bold'
                      color={colors.text}
                    >
                      {task.title}
                    </AppText>
                    <View className='mt-1 flex-row items-center gap-2'>
                      <AppText
                        variant='caption'
                        color={colors.textSecondary}
                        className='font-semibold'
                      >
                        {task.key}
                      </AppText>
                      <AppText variant='caption' color={colors.textSecondary}>
                        =
                      </AppText>
                      <View
                        className='rounded px-2 py-0.5'
                        style={{ backgroundColor: colors.background }}
                      >
                        <AppText
                          variant='caption'
                          className='font-medium'
                          color={colors.text}
                        >
                          {task.status}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className='items-center justify-center rounded-2xl border py-6'
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <AppText variant='body' color={colors.textSecondary}>
                No tasks due on this date.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <TouchableOpacity
          className='flex-1 items-center justify-center bg-black/50 p-5'
          activeOpacity={1}
          onPress={() => setIsPickerVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className='w-full max-w-sm rounded-3xl border p-5'
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View
              className='mb-4 flex-row items-center justify-between border-b pb-3'
              style={{ borderColor: colors.border }}
            >
              <TouchableOpacity
                onPress={() => setModalYear(prev => prev - 1)}
                className='p-1'
              >
                <Ionicons name='chevron-back' size={20} color={colors.text} />
              </TouchableOpacity>

              <AppText
                variant='title'
                className='font-bold'
                color={colors.text}
              >
                {modalYear}
              </AppText>

              <TouchableOpacity
                onPress={() => setModalYear(prev => prev + 1)}
                className='p-1'
              >
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View className='flex-row flex-wrap justify-between gap-y-3'>
              {Array.from({ length: 12 }, (_, idx) => {
                const monthNum = idx + 1;
                const isCurrentSelected =
                  monthNum === activeMonth && modalYear === activeYear;
                const monthNameShort = new Date(2000, idx).toLocaleString(
                  'default',
                  { month: 'short' },
                );

                return (
                  <TouchableOpacity
                    key={monthNum}
                    activeOpacity={0.7}
                    onPress={() => handleSelectMonthFromPicker(idx)}
                    className='items-center justify-center rounded-xl border p-3'
                    style={{
                      width: '30%',
                      backgroundColor: isCurrentSelected
                        ? colors.primary
                        : colors.background,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText
                      variant='body'
                      className='font-bold'
                      style={{
                        color: isCurrentSelected ? colors.white : colors.text,
                      }}
                    >
                      {monthNameShort}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Calendar;
