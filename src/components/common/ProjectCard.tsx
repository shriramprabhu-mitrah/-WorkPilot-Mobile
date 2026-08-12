import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../common/AppText';
import { RootStackParamList } from '../../types/navigationTypes';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';

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
  onPress?: () => void;
  onToggleStar?: () => void;
}

const ProjectCard = ({ item, onPress, onToggleStar }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      const targetId = item.id;
      if (targetId) {
        navigation.navigate('projectDetails', { id: targetId });
      }
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
        className='items-center justify-center'
        style={{
          width: moderateScale(44),
          height: moderateScale(44),
          backgroundColor: colors.primary,
          borderRadius: Radius.sm,
        }}
      >
        <AppText variant='title' className='font-bold' color={colors.white}>
          {getInitials(item.name)}
        </AppText>
      </View>
      <View className='flex-1' style={{ gap: layout.mediumGap }}>
        <AppText
          variant='body'
          color={colors.text}
          className='font-bold'
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
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;
