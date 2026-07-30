import { StringsType } from '../constants/textConfig';
import { useTheme } from '../theme/ThemeProvider';

const { colors } = useTheme();

export const todo = [
  {
    id: 'CLOUD-340',
    title: 'Implement zero-downtime deployment pipeline',
    priority: colors.accentOrange,
    points: '8p',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-342',
    title: 'Configure Terraform modules for VPC setup',
    priority: colors.warning,
    points: '5p',
    avatar: 'T',
    avatarColor: colors.primary,
  },
  {
    id: 'CLOUD-343',
    title: 'Fix memory leak in health check endpoint',
    priority: colors.accentOrange,
    points: '3p',
    avatar: 'B',
    avatarColor: colors.error,
  },
];

export const progress = [
  {
    id: 'CLOUD-330',
    title: 'OAuth token refresh falling on iOS clients',
    priority: colors.accentOrange,
    points: '5p',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-331',
    title: 'Migrate auth service to k8s v1.28',
    priority: colors.warning,
    points: '13p',
    avatar: 'T',
    avatarColor: colors.primary,
  },
];

export const review = [
  {
    id: 'CLOUD-320',
    title: 'Add circuit breaker pattern to API calls',
    priority: colors.warning,
    points: '8p',
    avatar: 'S',
    avatarColor: colors.success,
  },
];

export const done = [
  {
    id: 'CLOUD-310',
    title: 'Set up monitoring dashboards in Grafana',
    priority: colors.success,
    points: '5p',
    avatar: 'S',
    avatarColor: colors.success,
  },
  {
    id: 'CLOUD-311',
    title: 'Configure alerting rules for SLA breaches',
    priority: colors.success,
    points: '3p',
    avatar: 'T',
    avatarColor: colors.info,
  },
  {
    id: 'CLOUD-312',
    title: 'Fix flaky integration tests in CI pipeline',
    priority: colors.warning,
    points: '2p',
    avatar: 'B',
    avatarColor: colors.accentOrange,
  },
];

export const recentProjects = [
  {
    id: '1',
    name: 'Cloud Migration',
    code: 'CM',
    type: 'CLOUD',
    category: 'Software',
    issues: 142,
    color: colors.primary,
    starred: true,
  },
  {
    id: '2',
    name: 'Mobile App v3',
    code: 'MA',
    type: 'MOB',
    category: 'Software',
    issues: 89,
    color: colors.accentPurple,
    starred: true,
  },
  {
    id: '3',
    name: 'API Gateway',
    code: 'AG',
    type: 'API',
    category: 'Software',
    issues: 56,
    color: colors.accentOrange,
    starred: false,
  },
  {
    id: '4',
    name: 'Design System',
    code: 'DS',
    type: 'DS',
    category: 'Business',
    issues: 34,
    color: colors.success,
    starred: false,
  },
  {
    id: '5',
    name: 'Security Audit',
    code: 'SA',
    type: 'SEC',
    category: 'Software',
    issues: 28,
    color: colors.warning,
    starred: false,
  },
  {
    id: '6',
    name: 'Data Pipeline',
    code: 'DP',
    type: 'DATA',
    category: 'Software',
    issues: 67,
    color: colors.info,
    starred: false,
  },
  {
    id: '7',
    name: 'DevOps Platform',
    code: 'DP',
    type: 'OPS',
    category: 'Software',
    issues: 112,
    color: colors.secondary,
    starred: false,
  },
];

export const getColumns = (strings: StringsType) => {
  return [
    {
      title: strings.projectDetails?.toDo || 'TO DO',
      color: colors.textSecondary,
      tasks: todo,
    },
    {
      title: strings.projectDetails?.inProgress || 'IN PROGRESS',
      color: colors.primary,
      tasks: progress,
    },
    {
      title: strings.projectDetails?.inReview || 'IN REVIEW',
      color: colors.accentPurple,
      tasks: review,
    },
    {
      title: strings.projectDetails?.done || 'DONE',
      color: colors.success,
      tasks: done,
    },
  ];
};
