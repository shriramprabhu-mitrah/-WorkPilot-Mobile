import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  getStatusLabel,
  getStatusThemeColor,
  STATUS_OPTIONS,
  TASK_STATUS_LABELS,
  IssueStatus,
} from '../utils/enum';
import { ThemeColors } from '../constants/Colors';

interface Props {
  colors: ThemeColors;
  currentItem: any;
  status: string;
  activeStatusColor: string;
  showStatusPicker: boolean;
  onToggleStatusPicker: () => void;
  onSelectStatus: (status: IssueStatus | string) => void;
}

export const IssueHeaderSection: React.FC<Props> = ({
  colors,
  currentItem,
  status,
  activeStatusColor,
  showStatusPicker,
  onToggleStatusPicker,
  onSelectStatus,
}) => {
  const { layout } = useAuthLayout();

  return (
    <View
      className='z-10 border-b'
      style={{
        backgroundColor: colors.card || colors.surface,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.largeSectionGap,
        gap: layout.elementGap,
      }}
    >
      <AppText
        variant='title'
        color={colors.text}
        className='text-xl font-bold capitalize'
      >
        {currentItem?.title}
      </AppText>

      <View className='relative z-50'>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleStatusPicker}
          className='flex-row items-center self-start rounded-lg border'
          style={{
            backgroundColor: `${activeStatusColor}1A`,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
            gap: layout.tightGap,
          }}
        >
          <View
            className='mr-1 rounded-full'
            style={{
              width: 8,
              height: 8,
              backgroundColor: activeStatusColor,
            }}
          />
          <AppText
            variant='body'
            color={activeStatusColor}
            className='font-semibold'
          >
            {getStatusLabel(status || currentItem?.status)}
          </AppText>
          <Ionicons
            name={showStatusPicker ? 'chevron-up' : 'chevron-down'}
            size={layout.controlSize * 0.8}
            color={activeStatusColor}
          />
        </TouchableOpacity>

        {/* Inline Dropdown Option Box */}
        {showStatusPicker && (
          <>
            {/* Backdrop layer to capture outside clicks and close the dropdown */}
            <TouchableWithoutFeedback onPress={onToggleStatusPicker}>
              <View
                className='absolute inset-0 z-40'
                style={{ width: 1000, height: 1000, left: -500, top: -500 }}
              />
            </TouchableWithoutFeedback>

            <View
              className='absolute left-0 top-12 z-50 w-48 border'
              style={{
                borderRadius: Radius.sm,
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.elementGap,
                gap: 4,
              }}
            >
              {STATUS_OPTIONS.map(enumKey => {
                const isSelected =
                  (status || currentItem?.status)?.toLowerCase() === enumKey;
                const itemColor = getStatusThemeColor(enumKey, colors);
                return (
                  <TouchableOpacity
                    key={enumKey}
                    activeOpacity={0.8}
                    onPress={() => onSelectStatus(enumKey)}
                    className='flex-row items-center rounded-md px-2 py-2'
                    style={{
                      gap: 12,
                    }}
                  >
                    <View
                      className='rounded-full'
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: itemColor,
                      }}
                    />
                    <AppText
                      variant='body'
                      color={isSelected ? itemColor : colors.text}
                      className={isSelected ? 'font-bold' : 'font-normal'}
                    >
                      {TASK_STATUS_LABELS[enumKey] || getStatusLabel(enumKey)}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
};
