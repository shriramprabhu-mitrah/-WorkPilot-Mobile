import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../common/AppText';
import { RootStackParamList } from '../../types/navigationTypes';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { WorkItemIcon } from './getWorkItemIcon';

export interface ProjectCardItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  sprint_count: number;
  status: string;
  starred?: boolean;
}

interface Props {
  item: ProjectCardItem;
  onPress?: (id: string, name: string) => void;
  onToggleStar?: () => void;
}

const ProjectCard = ({ item, onPress, onToggleStar }: Props) => {
  // const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();

  const handlePress = () => {
    const targetId = item.id;
    const projectName = item.name;
    if (!targetId && !projectName) {
      return;
    }
    if (onPress) {
      onPress(targetId, projectName);
      console.log('card');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    return name.charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className='flex-row items-center border p-3.5'
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: Radius.md,
        gap: layout.elementGap,
      }}
    >
      <View
        className='mr-3.5 items-center justify-center rounded-lg'
        style={{
          width: moderateScale(30),
          height: moderateScale(30),
          backgroundColor: colors.surface,
        }}
      >
        <WorkItemIcon type='project' size={moderateScale(20)} />
      </View>
      <View className='flex-1' style={{ gap: layout.mediumGap }}>
        <AppText
          variant='body'
          color={colors.text}
          className='font-bold capitalize'
          numberOfLines={1}
        >
          {item.name}
        </AppText>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          numberOfLines={1}
        >
          {item.description ?? 'No Description'}
        </AppText>
        <View className='flex-row' style={{ gap: layout.elementGap }}>
          <AppText
            variant='caption'
            color={colors.text}
            className='font-medium'
          >
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-'}
          </AppText>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='font-semibold'
          >
            {item.sprint_count && item.sprint_count > 0
              ? `${item.sprint_count} ${
                  item.sprint_count <= 1 ? 'Sprint' : 'Sprints'
                }`
              : '0 Sprint'}
          </AppText>
        </View>
      </View>
      <View
        className='flex-row items-center'
        style={{ gap: layout.elementGap }}
      >
        <View
          className='items-center justify-center px-3 py-1'
          style={{
            backgroundColor: colors.surface,
            borderRadius: Radius.circle,
          }}
        >
          <AppText
            variant='caption'
            style={{ color: colors.primary }}
            className='font-semibold'
          >
            {item.status}
          </AppText>
        </View>
        {onToggleStar && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={e => {
              e.stopPropagation();
              onToggleStar();
            }}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={item.starred ? 'star' : 'star-outline'}
              size={layout.iconSize * 0.75}
              color={item.starred ? colors.warning : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;
