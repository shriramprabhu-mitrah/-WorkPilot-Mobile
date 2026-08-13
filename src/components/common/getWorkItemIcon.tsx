import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface WorkItemIconProps {
  type: string;
  size?: number;
  color?: string;
}

export const WorkItemIcon: React.FC<WorkItemIconProps> = ({ type, size = 18, color }) => {
  const { colors } = useTheme();

  switch (type) {
    case 'project':
      return <Ionicons name='thunderstorm-outline' size={size} color={color || '#9C88FF'} />;
    case 'board':
      return <MaterialDesignIcons name='view-dashboard-outline' size={size} color={colors?.accentPurple || '#B084F9'} />;
    case 'task':
      return <Ionicons name='checkbox-outline' size={size} color={colors?.secondary || '#3B82F6'} />;
    case 'userStory':
      return <Ionicons name='bookmark-outline' size={size} color={colors?.success || '#10B981'} />;
    case 'bug':
      return <Ionicons name='bug-outline' size={size} color={color || '#EF4444'} />;
    case 'epic':
      return <Ionicons name='flash-outline' size={size} color={colors?.accentPurple || '#A855F7'} />;
    default:
      return <Ionicons name='document-text-outline' size={size} color={color || '#9CA3AF'} />;
  }
};

// Keep backward compat alias
export const getWorkItemIcon = WorkItemIcon;
