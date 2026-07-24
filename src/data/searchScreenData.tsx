import { useTheme } from '../theme/ThemeProvider';

const { colors } = useTheme();

export const FILTERS = ['All', 'Issues', 'Projects', 'Boards', 'People'];

export const RECENT_SEARCHES = [
  'OAuth token',
  'Sprint 14',
  'CLOUD-330',
  'mobile push notifications',
];

export const TRENDING = [
  {
    id: 'CLOUD-330',
    letter: 'B',
    colorKey: colors.error, // Will resolve from colors hook
    title: 'OAuth token refresh failing on iOS',
    subtitle: 'CLOUD-330 · CLOUD',
    type: 'Issues',
  },
  {
    id: 'MOB-128',
    letter: 'S',
    colorKey: colors.success,
    title: 'Implement push notifications for sprint 14',
    subtitle: 'MOB-128 · MOB',
    type: 'Issues',
  },
  {
    id: 'API-67',
    letter: 'T',
    colorKey: colors.primary,
    title: 'Update rate limiting documentation',
    subtitle: 'API-67 · API',
    type: 'Boards',
  },
];

export const SEARCH_RESULTS = [
  {
    id: 'CLOUD-330',
    letter: 'B',
    colorKey: colors.error,
    title: 'OAuth token refresh failing on iOS',
    subtitle: 'CLOUD-330 • In Progress',
    type: 'Issues',
  },
  {
    id: 'MOB-128',
    letter: 'S',
    colorKey: colors.success,
    title: 'Implement push notifications',
    subtitle: 'MOB-128 • To Do',
    type: 'Issues',
  },
  {
    id: 'API-67',
    letter: 'C',
    colorKey: colors.primary,
    title: 'Cloud Migration',
    subtitle: 'Project',
    type: 'Projects',
  },
];
