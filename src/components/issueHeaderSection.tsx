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
} from '../utils/enum';

interface Props {
  hooks: any;
}

export const IssueHeaderSection: React.FC<Props> = ({ hooks }) => {
  const { colors } = hooks;
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
        {hooks.currentItem?.title}
      </AppText>

      <View className='relative z-50'>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => hooks.setShowStatusPicker((prev: boolean) => !prev)}
          className='flex-row items-center self-start rounded-lg border'
          style={{
            backgroundColor: `${hooks.activeStatusColor}1A`,
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
              backgroundColor: hooks.activeStatusColor,
            }}
          />
          <AppText
            variant='body'
            color={hooks.activeStatusColor}
            className='font-semibold'
          >
            {getStatusLabel(hooks.status || hooks.currentItem?.status)}
          </AppText>
          <Ionicons
            name={hooks.showStatusPicker ? 'chevron-up' : 'chevron-down'}
            size={layout.controlSize * 0.8}
            color={hooks.activeStatusColor}
          />
        </TouchableOpacity>

        {/* Inline Dropdown Option Box */}
        {hooks.showStatusPicker && (
          <>
            {/* Backdrop layer to capture outside clicks and close the dropdown */}
            <TouchableWithoutFeedback
              onPress={() => hooks.setShowStatusPicker(false)}
            >
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
                  (hooks.status || hooks.currentItem?.status)?.toLowerCase() ===
                  enumKey;
                const itemColor = getStatusThemeColor(enumKey, colors);
                return (
                  <TouchableOpacity
                    key={enumKey}
                    activeOpacity={0.8}
                    onPress={() => {
                      hooks.setStatus(enumKey);
                      hooks.setShowStatusPicker(false);
                    }}
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
