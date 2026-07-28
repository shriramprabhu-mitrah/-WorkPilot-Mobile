import { ThemeContextType, useTheme } from '../theme/ThemeProvider';
const { colors } = useTheme();
export type StatusType = string;

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  color: string;
  time: string;
  text: string;
}

export interface DetailItem {
  label: string;
  value: string;
  initials?: string;
  color?: string;
  dot?: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface StatusColor {
  bg: string;
  text: string;
}

export type StatusColorMap = Record<StatusType, StatusColor>;

export interface Issue {
  id: string;
  title: string;
  status: StatusType;
  priority?: 'Low' | 'Medium' | 'High';
  type?: string;
  project?: string;
  assignee?: string;
  points?: string | number;
  avatar?: string;
  avatarColor?: string;
  newComment?: string;
}

export const getComments = (colors: ThemeContextType['colors']): Comment[] => [
  {
    id: 1,
    author: 'Maya Kim',
    avatar: 'MK',
    color: colors.primary,
    time: '2 hours ago',
    text: "I've reproduced this on iOS 17.2 as well. The token seems to expire before the refresh callback fires.",
  },
  {
    id: 2,
    author: 'Sam Rivera',
    avatar: 'SR',
    color: colors.error || colors.primary,
    time: '1 hour ago',
    text: 'Looking at the auth service logs, the token TTL is set to 15 minutes but the client expects 30. Could be a misconfiguration.',
  },
  {
    id: 3,
    author: 'Alex Johnson',
    avatar: 'AJ',
    color: colors.warning || colors.primary,
    time: '45 min ago',
    text: "Good catch! I'll check the env vars and update the TTL. Should have a fix ready by EOD.",
  },
];

export const getDetails = (
  colors: ThemeContextType['colors'],
): DetailItem[] => [
  {
    label: 'Assignee',
    initials: 'AJ',
    color: colors.warning || colors.primary,
    value: 'Alex Johnson',
  },
  {
    label: 'Reporter',
    initials: 'MK',
    color: colors.primary,
    value: 'Maya Kim',
  },
  {
    label: 'Priority',
    value: 'High',
    dot: colors.error || colors.primary,
  },
  {
    label: 'Sprint',
    value: 'Sprint 14',
  },
  {
    label: 'Story points',
    value: '5',
  },
  {
    label: 'Due date',
    value: 'Jul 22, 2025',
  },
];

export const subtasks: Subtask[] = [
  {
    id: 'CLOUD-330a',
    title: 'Reproduce and document the failure scenario',
    done: true,
  },
  {
    id: 'CLOUD-330b',
    title: 'Fix token TTL mismatch in auth service config',
    done: false,
  },
  {
    id: 'CLOUD-330c',
    title: 'Add integration test for token refresh flow',
    done: false,
  },
];

export const statusOptions: StatusType[] = [
  'To Do',
  'In Progress',
  'In Review',
  'Done',
];

export const getStatusColors = (
  colors: ThemeContextType['colors'],
): StatusColorMap => ({
  'To Do': {
    bg: colors.surface || colors.background,
    text: colors.textSecondary,
  },
  'In Progress': {
    bg: colors.card || colors.surface,
    text: colors.primary,
  },
  'In Review': {
    bg: colors.card || colors.surface,
    text: colors.secondary || colors.primary,
  },
  Done: {
    bg: colors.card || colors.surface,
    text: colors.success || colors.primary,
  },
});

export const myIssues: Issue[] = [
  {
    id: 'API-72',
    title: 'Update OpenAPI spec for v3 endpoints',
    type: 'assigned',
    status: 'In Progress',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.info,
  },
  {
    id: 'MOB-128',
    title:
      'The push notification service is ready for testing on both iOS and Android.',
    type: 'comment',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'DS-14',
    title: 'Design token audit → In Review',
    type: 'status',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'mention',
    title: '@alex can you review the Terraform plan before we apply?',
    type: 'mention',
    status: 'In Progress',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.info,
  },
  {
    id: 'MOB-100',
    title: 'Offline mode support implementation',
    type: 'assigned',
    status: 'In Progress',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'API-67',
    title: 'Rate limiting documentation updates ready for review',
    type: 'review',
    status: 'In Progress',
    priority: 'High',
    avatar: 'T',
    avatarColor: colors.info,
  },
  {
    type: 'Issue',
    id: 'MOB-129',
    title: 'Dark mode flicker on navigation',
    status: 'In Review',
    priority: 'High',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-341',
    status: 'In Progress',
    title: 'OAuth token refresh failing on iOS clients',
    type: 'Bug',
    priority: 'High',
    avatar: 'B',
    avatarColor: colors.error,
  },
  {
    id: 'CLOUD-320',
    title: 'Add circuit breaker pattern to API calls',
    priority: 'Low',
    type: 'status',
    status: 'In Review',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-302',
    title: '@alex can you review the Terraform plan before we apply?',
    priority: 'High',
    type: 'status',
    status: 'To Do',
    avatar: 'T',
    avatarColor: colors.primary,
  },
  {
    id: 'CLOUD-342',
    title: 'Configure Terraform modules for VPC setup',
    priority: 'Medium',
    type: 'status',
    status: 'To Do',
    avatar: 'T',
    avatarColor: colors.primary,
  },
  {
    id: 'CLOUD-343',
    title: 'Fix memory leak in health check endpoint',
    priority: 'High',
    type: 'status',
    status: 'To Do',
    avatar: 'B',
    avatarColor: colors.error,
  },
  {
    id: 'CLOUD-330',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'High',
    type: 'status',
    status: 'In Progress',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-331',
    title: 'Migrate auth service to k8s v1.28',
    priority: 'Medium',
    type: 'status',
    status: 'In Progress',
    avatar: 'T',
    avatarColor: colors.primary,
  },
  {
    id: 'CLOUD-310',
    title: 'Set up monitoring dashboards in Grafana',
    priority: 'Low',
    type: 'status',
    status: 'Done',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-311',
    title: 'Configure alerting rules for SLA breaches',
    priority: 'Low',
    type: 'status',
    status: 'Done',
    avatar: 'T',
    avatarColor: colors.primary,
  },
  {
    id: 'CLOUD-312',
    title: 'Fix flaky integration tests in CI pipeline',
    priority: 'Medium',
    type: 'status',
    status: 'Done',
    avatar: 'B',
    avatarColor: colors.error,
  },
  {
    id: 'star-1',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'Medium',
    type: 'status',
    status: 'In Progress',
    avatar: 'B',
    avatarColor: colors.error,
  },
  {
    id: 'star-2',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'Medium',
    type: 'status',
    status: 'In Progress',
    avatar: 'B',
    avatarColor: colors.error,
  },
];
