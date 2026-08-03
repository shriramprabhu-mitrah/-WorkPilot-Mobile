import { ThemeColors } from '../constants/Colors';

export const getRecentProjects = (colors: ThemeColors) => [
  {
    id: '1',
    key: 'CLOUD',
    name: 'Cloud Migration',
    color: colors.primary,
    avatar: 'CM',
  },
  {
    id: '2',
    key: 'MOB',
    name: 'Mobile App v3',
    color: colors.accentPurple,
    avatar: 'MA',
  },
  {
    id: '3',
    key: 'API',
    name: 'API Gateway',
    color: colors.accentOrange,
    avatar: 'AG',
  },
  {
    id: '4',
    key: 'DS',
    name: 'Design System',
    color: colors.success,
    avatar: 'DS',
  },
];
export const myIssues = [
  {
    id: 'CLOUD-341',
    type: 'bug',
    priority: 'high',
    title: 'OAuth token refresh failing on iOS',
    status: 'In Progress',
    project: 'CLOUD',
  },
  {
    id: 'MOB-128',
    type: 'story',
    priority: 'medium',
    title: 'Implement push notifications for sprint updates',
    status: 'To Do',
    project: 'MOB',
  },
  {
    id: 'API-67',
    type: 'task',
    priority: 'low',
    title: 'Update rate limiting documentation',
    status: 'In Review',
    project: 'API',
  },
  {
    id: 'DS-14',
    type: 'story',
    priority: 'medium',
    title: 'Design token audit and cleanup',
    status: 'To Do',
    project: 'DS',
  },
];

export const starredIssues = [
  { id: 'CLOUD-302', label: 'CLOUD-302 · Migrate to k8s v1.28', tag: 'Epic' },
  { id: 'MOB-100', label: 'MOB-100 · Offline mode support', tag: 'Story' },
];

export const getTypeIcon = (type: string, colors: ThemeColors) => {
  switch (type) {
    case 'bug':
      return { icon: 'B', color: colors.error };
    case 'story':
      return { icon: 'S', color: colors.success };
    case 'task':
      return { icon: 'T', color: colors.primary };
    default:
      return { icon: 'D', color: colors.primary };
  }
};

export const getPriorityColor = (priority: string, colors: ThemeColors) => {
  switch (priority) {
    case 'high':
      return colors.error;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.success;
    default:
      return colors.placeholder;
  }
};

export const getStatusBgStyle = (status: string, colors: ThemeColors) =>
  status === 'In Progress'
    ? `${colors.info}20`
    : status === 'In Review'
      ? `${colors.accentPurple}20`
      : status === 'To Do'
        ? colors.surface
        : `${colors.success}20`;

export const getStatusTextStyle = (status: string, colors: ThemeColors) =>
  status === 'In Progress'
    ? colors.info
    : status === 'In Review'
      ? colors.accentPurple
      : status === 'To Do'
        ? colors.textSecondary
        : colors.success;
