import { ThemeContextType } from '../theme/ThemeProvider';

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
  priority?: 'low' | 'medium' | 'high';
  type?: string;
  project?: string;
  assignee?: string;
  points?: string | number;
  avatar?: string;
  avatarColor?: string;
}

// Dynamic Mock Data Functions using Theme Colors

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
    id: 'CLOUD-341',
    type: 'bug',
    priority: 'high',
    title: 'OAuth token refresh failing on iOS',
    status: 'In Progress',
    project: 'CLOUD',
    assignee: 'AJ',
  },
  {
    id: 'MOB-128',
    type: 'story',
    priority: 'medium',
    title: 'Implement push notifications for sprint updates',
    status: 'To Do',
    project: 'MOB',
    assignee: 'AJ',
  },
  {
    id: 'API-67',
    type: 'task',
    priority: 'low',
    title: 'Update rate limiting documentation',
    status: 'In Review',
    project: 'API',
    assignee: 'AJ',
  },
  {
    id: 'DS-14',
    type: 'story',
    priority: 'medium',
    title: 'Design token audit and cleanup',
    status: 'To Do',
    project: 'DS',
    assignee: 'AJ',
  },
  {
    id: 'API-72',
    title: 'Update OpenAPI spec for v3 endpoints',
    type: 'assigned',
    status: 'In Progress',
    priority: 'high',
  },
  {
    id: 'MOB-128',
    title:
      'The push notification service is ready for testing on both iOS and Android.',
    type: 'comment',
    status: 'In Progress',
    priority: 'high',
  },
  {
    id: 'DS-14',
    title: 'Design token audit → In Review',
    type: 'status',
    status: 'In Progress',
    priority: 'high',
  },
  {
    id: 'mention',
    title: '@alex can you review the Terraform plan before we apply?',
    type: 'mention',
    status: 'In Progress',
    priority: 'high',
  },
  {
    id: 'MOB-100',
    title: 'Offline mode support implementation',
    type: 'assigned',
    status: 'In Progress',
    priority: 'high',
  },
  {
    id: 'API-67',
    title: 'Rate limiting documentation updates ready for review',
    type: 'review',
    status: 'In Progress',
    priority: 'high',
  },
  {
    type: 'Issue',
    id: 'MOB-129',
    title: 'Dark mode flicker on navigation',
    status: 'In Review',
    priority: 'high',
  },
  {
    id: 'CLOUD-320',
    status: 'Done',
    title: 'Circuit breaker implementation',
    type: 'status',
    priority: 'high',
  },
  {
    id: 'CLOUD-320',
    title: 'Add circuit breaker pattern to API calls',
    priority: 'low',
    type: 'status',
    status: 'In Review',
  },
  {
    id: 'CLOUD-341',
    title: 'Implement zero-downtime deployment pipeline',
    priority: 'high',
    type: 'status',
    status: 'To Do',
  },
  {
    id: 'CLOUD-342',
    title: 'Configure Terraform modules for VPC setup',
    priority: 'medium',
    type: 'status',
    status: 'To Do',
  },
  {
    id: 'CLOUD-343',
    title: 'Fix memory leak in health check endpoint',
    priority: 'high',
    type: 'status',
    status: 'To Do',
  },
  {
    id: 'CLOUD-330',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'high',
    type: 'status',
    status: 'In Progress',
  },
  {
    id: 'CLOUD-331',
    title: 'Migrate auth service to k8s v1.28',
    priority: 'medium',
    type: 'status',
    status: 'In Progress',
  },
  {
    id: 'CLOUD-310',
    title: 'Set up monitoring dashboards in Grafana',
    priority: 'low',
    type: 'status',
    status: 'Done',
  },
  {
    id: 'CLOUD-311',
    title: 'Configure alerting rules for SLA breaches',
    priority: 'low',
    type: 'status',
    status: 'Done',
  },
  {
    id: 'CLOUD-312',
    title: 'Fix flaky integration tests in CI pipeline',
    priority: 'medium',
    type: 'status',
    status: 'Done',
  },
  {
    id: 'star-1',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'medium',
    type: 'status',
    status: 'In Progress',
  },
  {
    id: 'star-2',
    title: 'OAuth token refresh falling on iOS clients',
    priority: 'medium',
    type: 'status',
    status: 'In Progress',
  },
];
