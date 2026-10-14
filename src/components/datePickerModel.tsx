import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, PanResponder } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';
import { moderateScale } from '../utils/responsive';

interface DatePickerModalProps {
  visible: boolean;
  title: string;
  selectedDate?: string;
  minDate?: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  showTimePicker?: boolean;
  selectedTime?: string;
  onSelectTime?: (time: string) => void;
  onSelectDateTime?: (date: string, time: string) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  selectedDate,
  minDate,
  onClose,
  onSelectDate,
  showTimePicker = false,
  selectedTime,
  onSelectTime,
  onSelectDateTime,
}) => {
  const { colors } = useTheme();
  const [draftDate, setDraftDate] = useState(selectedDate ?? '');
  const [draftTime, setDraftTime] = useState(selectedTime ?? '09:00');
  const [clockEditing, setClockEditing] = useState(false);
  const [clockUnit, setClockUnit] = useState<'hour' | 'minute'>('hour');
  const [timeAtClockOpen, setTimeAtClockOpen] = useState(
    selectedTime ?? '09:00',
  );

  useEffect(() => {
    if (visible) {
      setDraftDate(selectedDate ?? '');
      setDraftTime(selectedTime ?? '09:00');
      setClockEditing(false);
      setClockUnit('hour');
      setTimeAtClockOpen(selectedTime ?? '09:00');
    }
  }, [visible, selectedDate, selectedTime]);

  const handleDayPress = (day: DateData) => {
    if (showTimePicker) {
      setDraftDate(day.dateString);
      return;
    }
    onSelectDate(day.dateString);
    onClose();
  };

  const markedDate = showTimePicker ? draftDate : selectedDate;
  const [hourString, minuteString] = draftTime.split(':');
  const hour24 = Number(hourString) || 0;
  const minute = Number(minuteString) || 0;
  const hour12 = hour24 % 12 || 12;
  const isPM = hour24 >= 12;

  // 12 is placed at index 0 (-90 deg / top of the clock)
  const clockValues =
    clockUnit === 'hour'
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Clock Hand Geometry & Math
  const clockRadius = moderateScale(115);
  const handRadius = moderateScale(74);
  const currentVal = clockUnit === 'hour' ? hour12 : minute;
  const handAngleDeg =
    clockUnit === 'hour' ? (currentVal % 12) * 30 : (currentVal % 60) * 6;

  const updateFromCoordinates = (x: number, y: number) => {
    const dx = x - clockRadius;
    const dy = y - clockRadius;
    let angleRad = Math.atan2(dy, dx) + Math.PI / 2;
    if (angleRad < 0) angleRad += 2 * Math.PI;
    const angleDeg = (angleRad * 180) / Math.PI;

    if (clockUnit === 'hour') {
      let h = Math.round(angleDeg / 30) % 12;
      if (h === 0) h = 12;
      const nextHour = (h % 12) + (isPM ? 12 : 0);
      setDraftTime(
        `${String(nextHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      );
    } else {
      let m = Math.round(angleDeg / 6) % 60;
      setDraftTime(
        `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      );
    }
  };

  const clockPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: evt => {
      updateFromCoordinates(
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
      );
    },
    onPanResponderMove: evt => {
      updateFromCoordinates(
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
      );
    },
    onPanResponderRelease: () => {
      if (clockUnit === 'hour') {
        setClockUnit('minute');
      }
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className='flex-1 items-center justify-center bg-black/50'
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          className='rounded-2xl p-4'
          style={{
            width: '90%',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          {/* Header */}
          <View className='mb-3 flex-row items-center justify-between'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-semibold'
            >
              {title}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className='h-8 w-8 items-center justify-center rounded-full'
              style={{
                backgroundColor: colors.border + '40',
                borderColor: colors.border,
                borderWidth: 2,
              }}
            >
              <Ionicons name='close' size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {showTimePicker && !clockEditing && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: moderateScale(8),
                paddingHorizontal: moderateScale(4),
              }}
            >
              <AppText color={colors.textSecondary}>
                {draftDate
                  ? new Date(`${draftDate}T00:00:00`).toLocaleDateString(
                      'en-US',
                      { month: 'long', year: 'numeric' },
                    )
                  : 'Choose date'}
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  setTimeAtClockOpen(draftTime);
                  setClockEditing(true);
                  setClockUnit('hour');
                }}
                className='flex-row items-center rounded-lg px-3 py-2'
                style={{
                  backgroundColor: colors.card || colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Ionicons
                  name='time-outline'
                  size={moderateScale(17)}
                  color={colors.primary}
                />
                <AppText color={colors.text} className='ml-2 font-semibold'>
                  {`${hour12}:${String(minute).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`}
                </AppText>
              </TouchableOpacity>
            </View>
          )}

          {!showTimePicker || !clockEditing ? (
            <Calendar
              minDate={minDate}
              current={(showTimePicker ? draftDate : selectedDate) || minDate}
              onDayPress={handleDayPress}
              markedDates={
                markedDate
                  ? {
                      [markedDate]: {
                        selected: true,
                        selectedColor: colors.primary,
                      },
                    }
                  : {}
              }
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textSecondary,
                monthTextColor: colors.text,
                arrowColor: colors.primary,
              }}
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: moderateScale(12),
              }}
            >
              <AppText
                color={colors.textSecondary}
                style={{ marginBottom: moderateScale(12) }}
              >
                Select time
              </AppText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(8),
                  marginBottom: moderateScale(14),
                }}
              >
                <TouchableOpacity
                  onPress={() => setClockUnit('hour')}
                  style={{
                    padding: moderateScale(10),
                    borderRadius: moderateScale(8),
                    backgroundColor:
                      clockUnit === 'hour'
                        ? colors.primary + '22'
                        : colors.card,
                  }}
                >
                  <AppText
                    color={colors.text}
                    style={{ fontSize: moderateScale(30), fontWeight: '600' }}
                  >
                    {String(hour12).padStart(2, '0')}
                  </AppText>
                </TouchableOpacity>
                <AppText
                  color={colors.text}
                  style={{ fontSize: moderateScale(28) }}
                >
                  :
                </AppText>
                <TouchableOpacity
                  onPress={() => setClockUnit('minute')}
                  style={{
                    padding: moderateScale(10),
                    borderRadius: moderateScale(8),
                    backgroundColor:
                      clockUnit === 'minute'
                        ? colors.primary + '22'
                        : colors.card,
                  }}
                >
                  <AppText
                    color={colors.text}
                    style={{ fontSize: moderateScale(30), fontWeight: '600' }}
                  >
                    {String(minute).padStart(2, '0')}
                  </AppText>
                </TouchableOpacity>
                <View
                  style={{
                    gap: moderateScale(4),
                    marginLeft: moderateScale(4),
                  }}
                >
                  {(['AM', 'PM'] as const).map(period => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => {
                        const nextHour =
                          (hour24 % 12) + (period === 'PM' ? 12 : 0);
                        setDraftTime(
                          `${String(nextHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                        );
                      }}
                      style={{
                        paddingHorizontal: moderateScale(9),
                        paddingVertical: moderateScale(5),
                        borderRadius: moderateScale(5),
                        backgroundColor:
                          (period === 'PM') === isPM
                            ? colors.primary
                            : colors.card,
                      }}
                    >
                      <AppText
                        color={
                          (period === 'PM') === isPM ? '#FFFFFF' : colors.text
                        }
                      >
                        {period}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rotatable Analog Clock Face */}
              <View
                {...clockPanResponder.panHandlers}
                style={{
                  width: clockRadius * 2,
                  height: clockRadius * 2,
                  borderRadius: clockRadius,
                  backgroundColor: colors.card || colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderWidth: 1,
                  borderColor: colors.border + '50',
                }}
              >
                {/* Rotating Pointer Arm & Target Circle */}
                <View
                  pointerEvents='none'
                  style={{
                    position: 'absolute',
                    width: 2,
                    height: handRadius * 2,
                    left: clockRadius - 1,
                    top: clockRadius - handRadius,
                    alignItems: 'center',
                    transform: [{ rotate: `${handAngleDeg}deg` }],
                    zIndex: 1,
                  }}
                >
                  {/* Pointer Line */}
                  <View
                    style={{
                      width: 2,
                      height: handRadius,
                      backgroundColor: colors.primary,
                      marginTop: moderateScale(16),
                    }}
                  />
                </View>

                {/* Clock Hour / Minute Numbers */}
                {clockValues.map((value, index) => {
                  const angle = (index * 30 - 90) * (Math.PI / 180);
                  const isCurrent =
                    clockUnit === 'hour'
                      ? value === hour12
                      : Math.abs(value - minute) <= 2;
                  const label =
                    clockUnit === 'hour'
                      ? String(value)
                      : String(value).padStart(2, '0');

                  return (
                    <View
                      key={value}
                      pointerEvents='none'
                      style={{
                        position: 'absolute',
                        left:
                          clockRadius +
                          Math.cos(angle) * handRadius -
                          moderateScale(16),
                        top:
                          clockRadius +
                          Math.sin(angle) * handRadius -
                          moderateScale(16),
                        width: moderateScale(32),
                        height: moderateScale(32),
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: moderateScale(16),
                        backgroundColor: isCurrent
                          ? colors.primary
                          : 'transparent',
                        zIndex: 2,
                      }}
                    >
                      <AppText
                        color={isCurrent ? '#FFFFFF' : colors.text}
                        style={{
                          fontWeight: isCurrent ? '700' : '500',
                          fontSize: moderateScale(13),
                        }}
                      >
                        {label}
                      </AppText>
                    </View>
                  );
                })}

                {/* Center Pin */}
                <View
                  pointerEvents='none'
                  style={{
                    width: moderateScale(10),
                    height: moderateScale(10),
                    borderRadius: moderateScale(5),
                    backgroundColor: colors.primary,
                    zIndex: 3,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                  gap: moderateScale(18),
                  marginTop: moderateScale(14),
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setDraftTime(timeAtClockOpen);
                    setClockEditing(false);
                  }}
                >
                  <AppText color={colors.primary}>Cancel</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setClockEditing(false)}>
                  <AppText color={colors.primary} className='font-semibold'>
                    OK
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showTimePicker && !clockEditing && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (draftDate && onSelectDateTime) {
                  onSelectDateTime(draftDate, draftTime);
                } else {
                  if (draftDate) onSelectDate(draftDate);
                  onSelectTime?.(draftTime);
                }
                onClose();
              }}
              style={{
                backgroundColor: colors.primary,
                padding: moderateScale(12),
                borderRadius: moderateScale(8),
                alignItems: 'center',
                marginTop: moderateScale(8),
              }}
            >
              <AppText color='#FFFFFF' className='font-semibold'>
                Apply date and time
              </AppText>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DatePickerModal;
