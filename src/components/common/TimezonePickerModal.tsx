import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './AppText';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';

interface TimezonePickerModalProps {
  visible: boolean;
  timezone: string;
  timezoneOptions: { value: string; flag: string }[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (timezone: string) => void;
  onClose: () => void;
}

const TimezonePickerModal: React.FC<TimezonePickerModalProps> = ({
  visible,
  timezone,
  timezoneOptions,
  search,
  onSearchChange,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  const filteredTimezones = timezoneOptions.filter(option =>
    option.value.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View className='mb-10 flex-1 justify-end bg-black/50'>
        <View
          className='rounded-t-2xl p-4'
          style={{
            maxHeight: '75%',
            backgroundColor: colors.background,
            paddingBottom: moderateScale(28),
          }}
        >
          <View className='mb-3 flex-row items-center justify-between'>
            <AppText variant='title' className='font-semibold'>
              Select Time Zone
            </AppText>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name='close'
                size={moderateScale(22)}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder='Search time zones'
            placeholderTextColor={colors.placeholder}
            autoCapitalize='none'
            style={{
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: Radius.md,
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(10),
              marginBottom: moderateScale(8),
            }}
          />

          <ScrollView keyboardShouldPersistTaps='handled'>
            {filteredTimezones.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSelect(option.value)}
                className='flex-row items-center border-b py-3'
                style={{ borderColor: colors.border }}
              >
                <AppText
                  variant='body'
                  style={{ marginRight: moderateScale(10) }}
                >
                  {option.flag}
                </AppText>

                <AppText
                  variant='body'
                  color={
                    option.value === timezone ? colors.primary : colors.text
                  }
                >
                  {option.value}
                </AppText>
              </TouchableOpacity>
            ))}

            {filteredTimezones.length === 0 && (
              <AppText
                variant='body'
                color={colors.textSecondary}
                style={{ paddingVertical: moderateScale(16) }}
              >
                No time zones found
              </AppText>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TimezonePickerModal;
