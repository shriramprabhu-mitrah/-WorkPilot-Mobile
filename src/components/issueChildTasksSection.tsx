import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  getStatusLabel,
  getStatusThemeColor,
  TASK_STATUS_LABELS,
} from '../utils/enum';
import { ThemeColors } from '../constants/Colors';

interface Props {
  subtasks: any[];
  colors: ThemeColors;
  projectId: string | undefined;
  navigation: any;
}

export const IssueChildTasksSection: React.FC<Props> = ({
  subtasks,
  colors,
  projectId,
  navigation,
}) => {
  const { layout } = useAuthLayout();

  return (
    <View
      className='mt-3'
      style={{
        backgroundColor: colors.card || colors.surface,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.sectionGap,
      }}
    >
      <View className='mb-3 flex-row items-center justify-between'>
        <AppText variant='bodyLarge' color={colors.text} className='font-bold'>
          Tasks ({subtasks.length})
        </AppText>
      </View>

      {subtasks.length > 0 ? (
        <View style={{ gap: layout.elementGap || 10 }}>
          {subtasks.map(item => {
            const rawStatus = (
              item.status ||
              item.status_id ||
              ''
            ).toLowerCase();
            const displayStatus =
              TASK_STATUS_LABELS[
                rawStatus as keyof typeof TASK_STATUS_LABELS
              ] ||
              getStatusLabel(rawStatus) ||
              item.status ||
              'To Do';
            const subtaskStatusColor = getStatusThemeColor(rawStatus, colors);
            const avatarLetter = (item.title || 'D').charAt(0).toUpperCase();

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('issue', { projectId, taskId: item.id })
                }
                className='flex-row items-center justify-between rounded-2xl border p-4'
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card || colors.surface,
                }}
              >
                <View
                  className='flex-1 flex-row items-center'
                  style={{ gap: 12 }}
                >
                  <View
                    className='h-12 w-12 items-center justify-center rounded-xl'
                    style={{ backgroundColor: colors.primary || '#0066FF' }}
                  >
                    <AppText
                      variant='title'
                      color='#FFFFFF'
                      className='text-lg font-bold'
                    >
                      {avatarLetter}
                    </AppText>
                  </View>

                  <View className='flex-1 justify-center' style={{ gap: 2 }}>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='text-base font-bold'
                      numberOfLines={1}
                    >
                      {item.title || 'Untitled Subtask'}
                    </AppText>
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='text-xs'
                      numberOfLines={1}
                    >
                      {item.key || item.formatted_serial_number || 'N/A'}
                    </AppText>
                  </View>
                </View>

                <View
                  className='mt-1 self-start rounded-full px-3 py-1'
                  style={{ backgroundColor: `${subtaskStatusColor}15` }}
                >
                  <AppText
                    variant='caption'
                    color={subtaskStatusColor}
                    className='text-xs font-semibold capitalize'
                  >
                    {displayStatus}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AppText variant='body' color={colors.textSecondary}>
          No child tickets.
        </AppText>
      )}
    </View>
  );
};
