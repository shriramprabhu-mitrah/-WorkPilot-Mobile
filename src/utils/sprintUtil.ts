import { ComponentProps } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { formatDate } from './utils';
import { ThemeColors } from '../constants/Colors';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

// ==========================================
// Accent Palette & Color Constants
// ==========================================
export const ACCENT_PALETTE = [
  '#7C3AED',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
] as const;

// Assets
export const SunsetHeaderImage = require('../assets/images/Serene Mountain Lake at Sunset.png');

// Types
export type FilterTab = 'all' | 'stories' | 'storyless' | 'high_priority';

export interface SprintActionItemConfig {
  label: string;
  icon: IoniconName;
  action: 'start' | 'complete' | 'resume' | 'none';
}

export const SPRINT_ACTION_CONFIG: Record<string, SprintActionItemConfig> = {
  planned: {
    label: 'Start Sprint',
    icon: 'play-outline',
    action: 'start',
  },
  active: {
    label: 'Complete Sprint',
    icon: 'checkmark-done-outline',
    action: 'complete',
  },
  on_hold: {
    label: 'Resume Sprint',
    icon: 'play-outline',
    action: 'resume',
  },
  completed: {
    label: 'Completed',
    icon: 'checkmark-circle-outline',
    action: 'none',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    action: 'none',
  },
  archived: {
    label: 'Archived',
    icon: 'archive-outline',
    action: 'none',
  },
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Converts a hex color string to rgba with given opacity.
 */
export const withOpacity = (hex: string, opacity: number): string => {
  if (!hex || !hex.startsWith('#')) return hex;
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
};

export const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
};

/**
 * Formats start and end dates using the existing formatDate helper.
 */
export const formatSprintDates = (
  startDate?: string,
  endDate?: string,
): string => {
  if (!startDate && !endDate) return '';
  if (startDate && endDate) {
    return `${formatDate(startDate)} → ${formatDate(endDate)}`;
  }
  return formatDate(startDate || endDate);
};

/**
 * Calculates sprint progress and remaining days.
 */
export const calculateSprintTimeline = (
  startDate?: string,
  endDate?: string,
): { progress: number; daysLeft: number } => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end <= start) {
    return { progress: 1, daysLeft: 0 };
  }
  const now = Date.now();
  const progress = Math.min(
    1,
    Math.max(0, (now - start.getTime()) / (end.getTime() - start.getTime())),
  );
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now) / 86400000));
  return { progress, daysLeft };
};
/**
 * Strips HTML tags and entities from string.
 */
export const cleanHtmlText = (html?: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Returns color corresponding to issue status using ACCENT_PALETTE.
 */
export const getStatusColor = (
  status?: string,
  defaultColor = '#94A3B8',
): string => {
  const s = status?.toLowerCase() || '';
  if (s.includes('active') || s.includes('progress')) return ACCENT_PALETTE[3]; // #10B981
  if (s.includes('plan') || s.includes('todo') || s.includes('backlog'))
    return ACCENT_PALETTE[4]; // #3B82F6
  if (s.includes('done') || s.includes('complete')) return ACCENT_PALETTE[0]; // #7C3AED
  return defaultColor;
};

/**
 * Calculates sprint percentage completed (0 - 100).
 */
export const calculateSprintProgress = (
  status?: string,
  timelineProgress = 1,
  completedCount = 0,
  totalCount = 0,
): number => {
  const sprintStatus = status?.trim().toLowerCase() ?? 'planned';
  if (sprintStatus === 'completed') return 100;
  if (timelineProgress !== undefined && timelineProgress !== null) {
    return Math.round(timelineProgress * 100);
  }
  if (totalCount > 0) {
    return Math.round((completedCount / totalCount) * 100);
  }
  return 100;
};

/**
 * Calculates circular SVG stroke dash offset for progress ring.
 */
export const calculateStrokeDashoffset = (
  progressPercent: number,
  circumference = 2 * Math.PI * 12,
): number => {
  return circumference * (1 - Math.min(1, Math.max(0, progressPercent / 100)));
};

export type MetricCardType = 'stories' | 'storyless' | 'high_priority';

export interface SprintMetricCardProps {
  type: MetricCardType;
  count: number;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}

export interface SprintItem {
  id: string;
  key?: string;
  title?: string;
  priority?: string;
  status?: string;
  is_favourite?: boolean;
  total_tasks?: number;
  isStoryless?: boolean;
  type?: string;
  rawItem: any;
}

export interface SprintItemCardProps {
  item: SprintItem;
  isSelected?: boolean;
  canDelete: boolean;
  colors: any;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  accentColor: string;
}

export interface SprintHeaderProps {
  sprint: {
    name: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  progressPercent: number;
  daysLeft: number;
  permissionsReady: boolean;
  canEditSprint: boolean;
  canDeleteSprint: boolean;
  onBack: () => void;
  onEditSprint: () => void;
  onOpenActionMenu: () => void;
  colors: ThemeColors;
}

export interface SprintGoalCardProps {
  goal?: string;
  sprintName?: string;
  canEdit: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

export interface SprintFilterBarProps {
  activeTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  isFilterActive: boolean;
  onToggleFilter: () => void;
  isSearchActive: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  totalFilteredCount: number;
  allCount: number;
  storiesCount: number;
  storylessCount: number;
  highPriorityCount: number;
  colors: ThemeColors;
}

export interface SprintActionMenuModalProps {
  visible: boolean;
  onClose: () => void;
  canCreateUserStory: boolean;
  canCreateTask: boolean;
  canEditSprint: boolean;
  canDeleteSprint: boolean;
  permissionsReady: boolean;
  sprintAction: SprintActionItemConfig;
  onCreateStory: () => void;
  onCreateStorylessTask: () => void;
  onSprintAction: () => void;
  onEditSprint: () => void;
  onDeleteSprint: () => void;
  colors: ThemeColors;
}

export interface SprintDetailsScreenProps {
  route: {
    params: {
      sprintId: string;
      sprintName?: string;
      projectId?: string | number;
    };
  };
}
