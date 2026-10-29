import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './common/AppText';
import { ThemeColors } from '../constants/Colors';
import { useTheme } from '../theme/ThemeProvider';
import { Radius } from '../constants/Radius';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_SECONDS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

export interface TaskDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (isoString: string) => void;
  onClear?: () => void;
  initialDate?: string | Date | null;
  colors?: ThemeColors;
}

export const TaskDatePickerModal: React.FC<TaskDatePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onClear,
  initialDate,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  const insets = useSafeAreaInsets();

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeString, setTimeString] = useState('00:00:00');

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimePickerOpen(false);
      if (initialDate) {
        const d =
          typeof initialDate === 'string' ? new Date(initialDate) : initialDate;
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
          setCurrentCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          const s = String(d.getSeconds()).padStart(2, '0');
          setTimeString(`${h}:${m}:${s}`);
          return;
        }
      }
      setSelectedDate(null);
      setCurrentCalendarMonth(new Date());
      setTimeString('00:00:00');
    }
  }, [visible, initialDate]);

  useEffect(() => {
    if (timePickerOpen) {
      const parts = (timeString || '00:00:00').split(':');
      const hIndex = HOURS.indexOf(parts[0] || '00');
      const mIndex = MINUTES_SECONDS.indexOf(parts[1] || '00');
      const sIndex = MINUTES_SECONDS.indexOf(parts[2] || '00');

      const timer = setTimeout(() => {
        if (hIndex > 0) {
          hoursScrollRef.current?.scrollTo({
            y: Math.max(0, (hIndex - 1) * 34),
            animated: true,
          });
        }
        if (mIndex > 0) {
          minutesScrollRef.current?.scrollTo({
            y: Math.max(0, (mIndex - 1) * 34),
            animated: true,
          });
        }
        if (sIndex > 0) {
          secondsScrollRef.current?.scrollTo({
            y: Math.max(0, (sIndex - 1) * 34),
            animated: true,
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timePickerOpen]);

  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentCalendarMonth]);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(
      new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() - 1,
        1,
      ),
    );
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(
      new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() + 1,
        1,
      ),
    );
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(
      currentCalendarMonth.getFullYear(),
      currentCalendarMonth.getMonth(),
      day,
    );
    setSelectedDate(newDate);
  };

  const handleConfirmDate = () => {
    const dateToUse = selectedDate || new Date();
    const year = dateToUse.getFullYear();
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
    const day = String(dateToUse.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}T${timeString || '00:00:00'}Z`;
    onConfirm(isoString);
    onClose();
  };

  const handleClear = () => {
    onClear?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={() => {
        if (timePickerOpen) setTimePickerOpen(false);
        else onClose();
      }}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
      >
        {/* Backdrop Tap to Close */}
        <Pressable
          onPress={() => {
            if (timePickerOpen) {
              setTimePickerOpen(false);
            } else {
              onClose();
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Modal Card */}
        <View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: colors.card || colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {/* Month Navigation */}
          <View className='mb-3 flex-row items-center justify-between'>
            <TouchableOpacity
              onPress={handlePrevMonth}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name='chevron-back'
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <AppText
              variant='body'
              color={colors.text}
              className='font-bold'
            >
              {currentCalendarMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </AppText>

            <TouchableOpacity
              onPress={handleNextMonth}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name='chevron-forward'
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View className='mb-2 flex-row justify-between'>
            {DAYS_OF_WEEK.map(d => (
              <AppText
                key={d}
                variant='caption'
                color={colors.textSecondary}
                style={{ width: 36, textAlign: 'center', fontWeight: '600' }}
              >
                {d}
              </AppText>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}
          >
            {calendarDays.map((dayNum, idx) => {
              if (dayNum === null) {
                return (
                  <View
                    key={`empty-${idx}`}
                    style={{ width: '14.28%', height: 36 }}
                  />
                );
              }

              const isSelected =
                selectedDate &&
                selectedDate.getDate() === dayNum &&
                selectedDate.getMonth() === currentCalendarMonth.getMonth() &&
                selectedDate.getFullYear() ===
                  currentCalendarMonth.getFullYear();

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  onPress={() => handleSelectDay(dayNum)}
                  style={{
                    width: '14.28%',
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected
                        ? colors.primary
                        : 'transparent',
                      backgroundColor: isSelected
                        ? `${colors.primary}15`
                        : 'transparent',
                    }}
                  >
                    <AppText
                      variant='body'
                      color={isSelected ? colors.primary : colors.text}
                      className={isSelected ? 'font-bold' : ''}
                    >
                      {dayNum}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Divider */}
          <View
            className='my-3'
            style={{ height: 1, backgroundColor: colors.border }}
          />

          {/* Time & Done row */}
          <View
            className='flex-row items-center justify-between'
            style={{ position: 'relative', zIndex: 50 }}
          >
            <View className='flex-row items-center' style={{ gap: 8 }}>
              <AppText variant='caption' color={colors.textSecondary}>
                Time
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTimePickerOpen(prev => !prev)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: timePickerOpen ? colors.primary : colors.border,
                  borderRadius: Radius.md,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  gap: 6,
                  backgroundColor: colors.surface,
                }}
              >
                <TextInput
                  value={timeString}
                  onChangeText={setTimeString}
                  placeholder='00:00:00'
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    padding: 0,
                    minWidth: 55,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setTimePickerOpen(prev => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name='time-outline'
                    size={16}
                    color={
                      timePickerOpen ? colors.primary : colors.textSecondary
                    }
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View className='flex-row items-center' style={{ gap: 8 }}>
              {onClear && initialDate && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                  }}
                >
                  <AppText
                    variant='caption'
                    color={colors.error || '#EF4444'}
                    className='font-bold'
                  >
                    Clear
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleConfirmDate}
                style={{
                  backgroundColor: colors.primary || '#0066FF',
                  borderRadius: Radius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <AppText
                  variant='caption'
                  color='#FFFFFF'
                  className='font-bold'
                >
                  Done
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker Popup & Backdrop */}
          {timePickerOpen && (
            <>
              <Pressable
                onPress={() => setTimePickerOpen(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 900,
                  backgroundColor: 'transparent',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 58,
                  left: 16,
                  width: 205,
                  height: 175,
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: Radius.md,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 30,
                  zIndex: 999,
                  flexDirection: 'row',
                  overflow: 'hidden',
                }}
              >
                {/* Hours Column */}
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderRightColor: colors.border,
                  }}
                >
                  <ScrollView
                    ref={hoursScrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingVertical: 2 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    nestedScrollEnabled={true}
                  >
                    {HOURS.map(h => {
                      const isSelected =
                        (timeString.split(':')[0] || '00') === h;
                      return (
                        <TouchableOpacity
                          key={`h-${h}`}
                          activeOpacity={0.6}
                          onPress={() => {
                            const parts = (timeString || '00:00:00').split(':');
                            const m = parts[1] || '00';
                            const s = parts[2] || '00';
                            setTimeString(`${h}:${m}:${s}`);
                          }}
                          style={{
                            height: 34,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected
                              ? `${colors.primary}20`
                              : 'transparent',
                          }}
                        >
                          <AppText
                            variant='caption'
                            color={isSelected ? colors.primary : colors.text}
                            style={{
                              fontWeight: isSelected ? 'bold' : 'normal',
                              fontSize: 13,
                            }}
                          >
                            {h}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Minutes Column */}
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderRightColor: colors.border,
                  }}
                >
                  <ScrollView
                    ref={minutesScrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingVertical: 2 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    nestedScrollEnabled={true}
                  >
                    {MINUTES_SECONDS.map(m => {
                      const isSelected =
                        (timeString.split(':')[1] || '00') === m;
                      return (
                        <TouchableOpacity
                          key={`m-${m}`}
                          activeOpacity={0.6}
                          onPress={() => {
                            const parts = (timeString || '00:00:00').split(':');
                            const h = parts[0] || '00';
                            const s = parts[2] || '00';
                            setTimeString(`${h}:${m}:${s}`);
                          }}
                          style={{
                            height: 34,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected
                              ? `${colors.primary}20`
                              : 'transparent',
                          }}
                        >
                          <AppText
                            variant='caption'
                            color={isSelected ? colors.primary : colors.text}
                            style={{
                              fontWeight: isSelected ? 'bold' : 'normal',
                              fontSize: 13,
                            }}
                          >
                            {m}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Seconds Column */}
                <View style={{ flex: 1 }}>
                  <ScrollView
                    ref={secondsScrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingVertical: 2 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    nestedScrollEnabled={true}
                  >
                    {MINUTES_SECONDS.map(s => {
                      const isSelected =
                        (timeString.split(':')[2] || '00') === s;
                      return (
                        <TouchableOpacity
                          key={`s-${s}`}
                          activeOpacity={0.6}
                          onPress={() => {
                            const parts = (timeString || '00:00:00').split(':');
                            const h = parts[0] || '00';
                            const m = parts[1] || '00';
                            setTimeString(`${h}:${m}:${s}`);
                          }}
                          style={{
                            height: 34,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected
                              ? `${colors.primary}20`
                              : 'transparent',
                          }}
                        >
                          <AppText
                            variant='caption'
                            color={isSelected ? colors.primary : colors.text}
                            style={{
                              fontWeight: isSelected ? 'bold' : 'normal',
                              fontSize: 13,
                            }}
                          >
                            {s}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TaskDatePickerModal;
