export const FILTERS = ['All', 'Issues', 'Projects', 'Boards', 'People'];

export const RECENT_SEARCHES = [
  'OAuth token',
  'Sprint 14',
  'CLOUD-330',
  'mobile push notifications',
];

export const getTrendingData = (colors: any) => [
  {
    id: 'CLOUD-330',
    letter: 'B',
    color: colors.error,
    title: 'OAuth token refresh failing on iOS',
    subtitle: 'CLOUD-330 · CLOUD',
    type: 'Issues',
  },
  {
    id: 'MOB-128',
    letter: 'S',
    color: colors.success,
    title: 'Implement push notifications for sprint 14',
    subtitle: 'MOB-128 · MOB',
    type: 'Issues',
  },
  {
    id: 'API-67',
    letter: 'T',
    color: colors.primary,
    title: 'Update rate limiting documentation',
    subtitle: 'API-67 · API',
    type: 'Boards',
  },
];

export const getSearchResultsData = (colors: any) => [
  {
    id: 'CLOUD-330',
    letter: 'B',
    color: colors.error,
    title: 'OAuth token refresh failing on iOS',
    subtitle: 'CLOUD-330 • In Progress',
    type: 'Issues',
  },
  {
    id: 'MOB-128',
    letter: 'S',
    color: colors.success,
    title: 'Implement push notifications',
    subtitle: 'MOB-128 • To Do',
    type: 'Issues',
  },
  {
    id: 'API-67',
    letter: 'C',
    color: colors.primary,
    title: 'Cloud Migration',
    subtitle: 'Project',
    type: 'Projects',
  },
];
