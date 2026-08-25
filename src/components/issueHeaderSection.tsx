import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from '../components/common/AppText';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { CustomStatus } from '../types/customstatus.type';
import { getStatusLabel } from '../utils/enum';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  colors: ThemeColors;
  currentItem: any;
  status: string;
  activeStatusColor: string;
  showStatusPicker: boolean;
  onToggleStatusPicker: () => void;
  onSelectStatus: (status: string) => void;
  onSelectId: (status: string) => void;
  customStatuses: CustomStatus[];
}

export const IssueHeaderSection: React.FC<Props> = ({
  currentItem,
  status,
  activeStatusColor,
  showStatusPicker,
  onToggleStatusPicker,
  onSelectStatus,
  onSelectId,
  customStatuses,
}) => {
  const { layout } = useAuthLayout();
  const { colors } = useTheme();

  /*
   * Fixed responsive width.
   *
   * The width is NOT based on the status name.
   */
  const statusWidth = Math.min(Math.max(layout.controlSize * 7, 160), 220);

  const currentStatus = status || currentItem?.status || '';

  return (
    <View
      className='z-10 border-b'
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.largeSectionGap,
        gap: layout.elementGap,
      }}
    >
      {/* Issue title */}
      <AppText
        variant='title'
        color={colors.text}
        className='text-xl font-bold capitalize'
      >
        {currentItem?.title}
      </AppText>

      <View
        className='relative z-50'
        style={{
          width: statusWidth,
        }}
      >
        {/* Status button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleStatusPicker}
          className='flex-row items-center rounded-lg border'
          style={{
            width: statusWidth,
            minHeight: layout.controlSize * 1.5,

            backgroundColor: `${activeStatusColor}1A`,
            borderColor: colors.border,

            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,

            gap: layout.tightGap,
          }}
        >
          {/* Status dot */}
          <View
            className='rounded-full'
            style={{
              width: Math.max(layout.controlSize * 0.3, 7),
              height: Math.max(layout.controlSize * 0.3, 7),
              backgroundColor: activeStatusColor,
            }}
          />

          {/* Status text */}
          <View
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <AppText
              variant='body'
              color={activeStatusColor}
              className='font-semibold'
              numberOfLines={2}
              ellipsizeMode='tail'
            >
              {getStatusLabel(currentStatus)}
            </AppText>
          </View>

          {/* Arrow */}
          <Ionicons
            name={showStatusPicker ? 'chevron-up' : 'chevron-down'}
            size={layout.controlSize * 0.8}
            color={activeStatusColor}
          />
        </TouchableOpacity>

        {/* Dropdown */}
        {showStatusPicker && (
          <>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onToggleStatusPicker}>
              <View
                className='absolute z-40'
                style={{
                  width: 1000,
                  height: 1000,
                  left: -500,
                  top: -500,
                }}
              />
            </TouchableWithoutFeedback>

            {/* Status dropdown */}
            <View
              className='absolute left-0 z-50 border'
              style={{
                top: '100%',
                marginTop: 4,

                width: statusWidth,

                borderRadius: Radius.sm,

                backgroundColor: colors.card,
                borderColor: colors.border,

                paddingHorizontal: layout.paddingHorizontal,

                paddingVertical: layout.elementGap,

                gap: layout.tightGap,

                shadowColor: colors.black,
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.15,
                shadowRadius: 6,

                elevation: 5,
              }}
            >
              {customStatuses
                ?.slice()
                .sort(
                  (a, b) => (a?.display_order ?? 0) - (b?.display_order ?? 0),
                )
                .map(customStatus => {
                  const statusName = customStatus?.name ?? '';
                  const statusId = customStatus?.id ?? '';

                  const isSelected =
                    currentStatus.toLowerCase() === statusName.toLowerCase();

                  return (
                    <TouchableOpacity
                      key={customStatus?.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        onSelectStatus(statusName);
                        onSelectId(statusId);
                      }}
                      className='flex-row items-start rounded-md'
                      style={{
                        minHeight: layout.controlSize * 1.4,

                        paddingVertical: layout.tightGap,

                        gap: layout.tightGap,
                      }}
                    >
                      {/* Status dot */}
                      <View
                        className='rounded-full'
                        style={{
                          width: 8,
                          height: 8,
                          marginTop: 6,
                          backgroundColor: customStatus?.color,
                        }}
                      />

                      {/* Status name */}
                      <View
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <AppText
                          variant='body'
                          color={isSelected ? customStatus?.color : colors.text}
                          className={isSelected ? 'font-bold' : 'font-normal'}
                        >
                          {statusName}
                        </AppText>
                      </View>
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
