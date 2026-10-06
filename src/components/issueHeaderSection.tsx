import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from '../components/common/AppText';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { CustomStatus, UserStoryStatusItem } from '../types/customstatus.type';
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
  statuses: CustomStatus[] | UserStoryStatusItem[] | [];
  isLoading?: boolean;
}

export const IssueHeaderSection: React.FC<Props> = ({
  currentItem,
  status,
  activeStatusColor,
  showStatusPicker,
  onToggleStatusPicker,
  onSelectStatus,
  onSelectId,
  statuses,
  isLoading = false,
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
      className='border-b'
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.largeSectionGap,
        gap: layout.elementGap,
        zIndex: showStatusPicker ? 100 : 1,
        elevation: showStatusPicker ? 10 : 0,
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
        className='relative'
        style={{
          width: statusWidth,
          zIndex: showStatusPicker ? 100 : 1,
        }}
      >
        {/* Status button / Skeleton */}
        {isLoading ? (
          <View
            className='flex-row items-center rounded-lg border'
            style={{
              width: statusWidth,
              minHeight: layout.controlSize * 1.5,
              backgroundColor: colors.surface || colors.card,
              borderColor: colors.border,
              paddingHorizontal: layout.paddingHorizontal,
              paddingVertical: layout.elementGap,
              gap: layout.elementGap,
            }}
          >
            <View
              className='animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'
              style={{
                width: Math.max(layout.controlSize * 0.3, 7),
                height: Math.max(layout.controlSize * 0.3, 7),
              }}
            />
            <View
              className='animate-pulse rounded bg-gray-200 dark:bg-gray-700'
              style={{
                width: '60%',
                height: 14,
              }}
            />
          </View>
        ) : (
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

              gap: layout.elementGap,
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
        )}

        {/* Dropdown */}
        {showStatusPicker && (
          <>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onToggleStatusPicker}>
              <View
                className='absolute z-40'
                style={{
                  width: 3000,
                  height: 3000,
                  left: -1500,
                  top: -1500,
                }}
              />
            </TouchableWithoutFeedback>

            {/* Status dropdown */}
            <View
              className='absolute left-0 z-50 border shadow-lg'
              style={{
                top: '100%',
                marginTop: 6,
                minWidth: Math.max(statusWidth, 180),
                borderRadius: Radius.md,
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                padding: 6,
                gap: 2,
                shadowColor: colors.black,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 12,
              }}
            >
              {statuses
                ?.slice()
                .sort(
                  (a, b) => (a?.display_order ?? 0) - (b?.display_order ?? 0),
                )
                .map(statusItem => {
                  const statusName = statusItem?.name ?? '';
                  const statusId = statusItem?.id ?? '';

                  const isSelected =
                    currentStatus.toLowerCase() === statusName.toLowerCase() ||
                    currentStatus.toLowerCase() === statusId.toLowerCase();

                  return (
                    <TouchableOpacity
                      key={statusItem?.id || statusName}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectStatus(statusName);
                        onSelectId(statusId);
                      }}
                      className='flex-row items-center rounded-md'
                      style={{
                        paddingVertical: 9,
                        paddingHorizontal: 10,
                        gap: 10,
                        backgroundColor: isSelected
                          ? `${statusItem?.color}18`
                          : 'transparent',
                      }}
                    >
                      {/* Status dot */}
                      <View
                        className='rounded-full'
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: statusItem?.color,
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
                          color={isSelected ? statusItem?.color : colors.text}
                          className={
                            isSelected
                              ? 'text-sm font-bold'
                              : 'text-sm font-medium'
                          }
                          numberOfLines={1}
                        >
                          {statusName}
                        </AppText>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name='checkmark'
                          size={15}
                          color={statusItem?.color}
                        />
                      )}
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
