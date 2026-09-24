import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';

interface DatePickerModalProps {
  visible: boolean;
  title: string;
  selectedDate?: string;
  minDate?: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  selectedDate,
  minDate,
  onClose,
  onSelectDate,
}) => {
  const { colors } = useTheme();

  const handleDayPress = (day: DateData) => {
    onSelectDate(day.dateString);
    onClose();
  };

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
              style={{ backgroundColor: colors.border + '40' }}
            >
              <Ionicons name='close' size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Calendar
            minDate={minDate}
            current={selectedDate || minDate}
            onDayPress={handleDayPress}
            markedDates={
              selectedDate
                ? {
                    [selectedDate]: {
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DatePickerModal;
