import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';
import { formatDate } from '../utils/utils';

interface TaskCardProps {
  item: {
    id: string;
    title: string;
    priority?: string;
    points?: string;
    avatar?: string;
    avatarUrl?: string | null;
    avatarColor?: string;
    is_favourite?: boolean;
    [key: string]: any;
  };
  projectId?: string;
  onToggleFavorite?: () => void;
}

const TaskCard = ({ item, projectId, onToggleFavorite }: TaskCardProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  const openIssue = () => {
    navigation.navigate('issue', {
      projectId: projectId,
      taskId: item?.id,
      task: item as any,
    });
    const rootNavigation = navigation.getParent()?.getParent()?.getParent();

    if (rootNavigation) {
      rootNavigation.navigate('issue');
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#EF4444'; // Red

      case 'medium':
        return '#F59E0B'; // Orange

      case 'low':
        return '#22C55E'; // Green

      case 'urgent':
        return '#DC2626'; // Dark red

      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openIssue}
      className='border shadow'
      style={{
        position: 'relative',
        gap: layout.elementGap,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: isSmallHeight
          ? layout.largeSectionGap
          : layout.elementGap,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: Radius.sm,
      }}
    >
      {onToggleFavorite && (
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            position: 'absolute',
            top: 4,
            right: 8,
            zIndex: 10,
            padding: 2,
          }}
        >
          <AppText
            style={{
              color: item.is_favourite ? colors.warning : colors.textSecondary,
              fontSize: 18,
              lineHeight: 20,
            }}
          >
            {item.is_favourite ? '★' : '☆'}
          </AppText>
        </TouchableOpacity>
      )}

      <View className='flex-row'>
        <AppText
          variant='body'
          className='font-semibold leading-6'
          style={{
            color: colors.text,
            paddingRight: onToggleFavorite ? moderateScale(22) : 0,
          }}
          numberOfLines={2}
        >
          {item.title}
        </AppText>

        <View
          className='flex-row items-center'
          style={{ gap: moderateScale(4) }}
        >
          <Ionicons
            name='git-branch-outline'
            size={moderateScale(12)}
            color='#3B82F6'
          />
          <AppText
            variant='caption'
            className='font-semibold'
            style={{ color: '#3B82F6' }}
          >
            {item.key || item.task_key}
          </AppText>
        </View>
      </View>

      {(item.due_date || item.dueDate) && (
        <View
          className='flex-row items-center'
          style={{ gap: moderateScale(4) }}
        >
          <Ionicons
            name='calendar-outline'
            size={moderateScale(12)}
            color={colors.textSecondary}
          />
          <AppText variant='caption' color={colors.textSecondary}>
            {formatDate(item.due_date || item.dueDate)}
          </AppText>
        </View>
      )}

      <View className='flex-row items-center justify-between'>
        <View
          className='flex-row items-center'
          style={{ gap: layout.sectionGap }}
        >
          <View
            style={{
              backgroundColor: item.avatarUrl
                ? ''
                : item.avatarColor || colors.primary,
              width: moderateScale(22),
              height: moderateScale(22),
              borderRadius: Radius.circle,
            }}
            className='items-center justify-center rounded'
          >
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                style={{
                  width: moderateScale(22),
                  height: moderateScale(22),
                  borderRadius: Radius.circle,
                }}
              />
            ) : item.avatar ? (
              <AppText
                variant='caption'
                className='font-bold'
                color={colors.white}
              >
                {item.avatar}
              </AppText>
            ) : (
              <Ionicons
                name='person'
                size={moderateScale(14)}
                color={colors.white}
              />
            )}
          </View>

          <AppText
            variant='caption'
            className='font-semibold'
            style={{
              color: getPriorityColor(item.priority),
            }}
          >
            {item.priority}
          </AppText>
        </View>

        <View
          className='flex-row items-center'
          style={{ gap: layout.elementGap }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: layout.paddingHorizontal * 0.25,
              borderRadius: Radius.sm,
              paddingTop: layout.paddingTop * 0.25,
              paddingBottom: layout.paddingBottom * 0.25,
            }}
          >
            <AppText
              variant='caption'
              className='font-semibold'
              color={colors.textSecondary}
            >
              {item.story_points ?? 0} pts
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;
