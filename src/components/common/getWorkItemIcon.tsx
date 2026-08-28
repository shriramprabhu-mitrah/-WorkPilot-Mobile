import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../hooks/useTheme';

interface WorkItemIconProps {
  type: string;
  size?: number;
  color?: string;
}

export const WorkItemIcon: React.FC<WorkItemIconProps> = ({
  type,
  size = 18,
  color,
}) => {
  const { colors } = useTheme();

  switch (type) {
    case 'add':
    case 'attachment':
      return (
        <Ionicons
          name='add-circle-outline'
          size={size}
          color={color || colors?.primary || '#F59E0B'}
        />
      );
    case 'format-letter-case':
    case 'text-case':
      return (
        <MaterialDesignIcons
          name='format-letter-case'
          size={size}
          color={color || colors?.primary || '#F59E0B'}
        />
      );
    case 'project':
      return <Ionicons name='folder' size={size} color={color || '#9C88FF'} />;
    case 'board':
      return (
        <MaterialDesignIcons
          name='view-dashboard'
          size={size}
          color={colors?.accentPurple || '#B084F9'}
        />
      );
    case 'sprint':
      return (
        <Ionicons
          name='repeat'
          size={size}
          color={color || colors?.primary || '#F59E0B'}
        />
      );
    case 'task':
      return (
        <Ionicons
          name='checkbox'
          size={size}
          color={colors?.secondary || '#3B82F6'}
        />
      );
    case 'story':
    case 'user_story':
    case 'userStory':
      return (
        <Ionicons
          name='bookmark'
          size={size}
          color={color || colors?.success || '#10B981'}
        />
      );
    case 'bug':
      return <Ionicons name='bug' size={size} color={color || '#EF4444'} />;
    case 'epic':
      return (
        <Ionicons
          name='flash'
          size={size}
          color={colors?.accentPurple || '#A855F7'}
        />
      );
    case 'comment':
    case 'Comment':
      return (
        <Ionicons
          name='chatbubble'
          size={size}
          color={color || colors?.textSecondary}
        />
      );
    case 'chevron-up':
      return (
        <Ionicons name='chevron-up' size={size} color={color || colors?.text} />
      );
    case 'chevron-down':
      return (
        <Ionicons
          name='chevron-down'
          size={size}
          color={color || colors?.text}
        />
      );
    case 'chevron-right':
      return (
        <Ionicons
          name='chevron-forward'
          size={size}
          color={color || colors?.textSecondary}
        />
      );
    case 'image-placeholder':
      return <Ionicons name='image' size={size} color={color || '#FFF'} />;
    case 'edit':
      return (
        <Ionicons
          name='pencil'
          size={size}
          color={color || colors?.textSecondary}
        />
      );
    case 'summary':
      return (
        <Ionicons
          name='pie-chart'
          size={size}
          color={color || colors?.primary}
        />
      );
    case 'backlog':
      return (
        <Ionicons name='list' size={size} color={color || colors?.primary} />
      );
    case 'timeline':
      return (
        <Ionicons
          name='calendar'
          size={size}
          color={color || colors?.primary}
        />
      );
    case 'reports':
      return (
        <Ionicons
          name='bar-chart'
          size={size}
          color={color || colors?.primary}
        />
      );

    default:
      return (
        <Ionicons name='document-text' size={size} color={color || '#9CA3AF'} />
      );
  }
};

// Keep backward compat alias
export const getWorkItemIcon = WorkItemIcon;
