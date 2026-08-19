import { ThemeColors } from '../constants/Colors';
import { StringsType } from '../constants/textConfig';
import { UserStory } from '../types/project.type';

export interface Task {
  id: string;
  title: string;
  priority: string;
  points: string;
  avatar: string;
  avatarColor: string;
  status: string; // ADD THIS
}

export interface RecentProject {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  issues: number;
  color: string;
  starred: boolean;
}

export interface BoardUserStory {
  id: string;
  title: string;
  status: string;
  statusColor: string;
  points: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  tasks: Task[];
}

export interface KanbanColumn {
  title: string;
  color: string;
  userStories: BoardUserStory[];
}

// export const getTodo = (colors: ThemeColors): Task[] => [
//   {
//     id: 'CLOUD-340',
//     title: 'Implement zero-downtime deployment pipeline',
//     priority: colors.accentOrange,
//     points: '8p',
//     avatar: 'S',
//     avatarColor: colors.success,
//   },
//   {
//     id: 'CLOUD-342',
//     title: 'Configure Terraform modules for VPC setup',
//     priority: colors.warning,
//     points: '5p',
//     avatar: 'T',
//     avatarColor: colors.primary,
//   },
//   {
//     id: 'CLOUD-343',
//     title: 'Fix memory leak in health check endpoint',
//     priority: colors.accentOrange,
//     points: '3p',
//     avatar: 'B',
//     avatarColor: colors.error,
//   },
// ];

// export const getProgress = (colors: ThemeColors): Task[] => [
//   {
//     id: 'CLOUD-330',
//     title: 'OAuth token refresh falling on iOS clients',
//     priority: colors.accentOrange,
//     points: '5p',
//     avatar: 'S',
//     avatarColor: colors.success,
//   },
//   {
//     id: 'CLOUD-331',
//     title: 'Migrate auth service to k8s v1.28',
//     priority: colors.warning,
//     points: '13p',
//     avatar: 'T',
//     avatarColor: colors.primary,
//   },
// ];

// export const getReview = (colors: ThemeColors): Task[] => [
//   {
//     id: 'CLOUD-320',
//     title: 'Add circuit breaker pattern to API calls',
//     priority: colors.warning,
//     points: '8p',
//     avatar: 'S',
//     avatarColor: colors.success,
//   },
// ];

// export const getDone = (colors: ThemeColors): Task[] => [
//   {
//     id: 'CLOUD-310',
//     title: 'Set up monitoring dashboards in Grafana',
//     priority: colors.success,
//     points: '5p',
//     avatar: 'S',
//     avatarColor: colors.success,
//   },
//   {
//     id: 'CLOUD-311',
//     title: 'Configure alerting rules for SLA breaches',
//     priority: colors.success,
//     points: '3p',
//     avatar: 'T',
//     avatarColor: colors.info,
//   },
//   {
//     id: 'CLOUD-312',
//     title: 'Fix flaky integration tests in CI pipeline',
//     priority: colors.warning,
//     points: '2p',
//     avatar: 'B',
//     avatarColor: colors.accentOrange,
//   },
// ];

export const getRecentProjects = (colors: ThemeColors): RecentProject[] => [
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

// export const getColumns = (
//   strings: StringsType,
//   colors: ThemeColors,
// ): KanbanColumn[] => {
//   return [
//     {
//       title: strings.projectDetails?.toDo || 'TO DO',
//       color: colors.textSecondary,
//       tasks: getTodo(colors),
//     },
//     {
//       title: strings.projectDetails?.inProgress || 'IN PROGRESS',
//       color: colors.primary,
//       tasks: getProgress(colors),
//     },
//     {
//       title: strings.projectDetails?.inReview || 'IN REVIEW',
//       color: colors.accentPurple,
//       tasks: getReview(colors),
//     },
//     {
//       title: strings.projectDetails?.done || 'DONE',
//       color: colors.success,
//       tasks: getDone(colors),
//     },
//     {
//       title: strings.projectDetails?.testing || 'TESTING',
//       color: colors.accentOrange,
//       tasks: getTodo(colors),
//     },
//     {
//       title: strings.projectDetails?.blocked || 'BLOCKED',
//       color: colors.info,
//       tasks: getTodo(colors),
//     },
//   ];
// };

const getPriorityColor = (priority: string, colors: ThemeColors): string => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return colors.info;

    case 'medium':
      return colors.warning;

    case 'high':
      return colors.accentOrange;

    case 'critical':
      return colors.error;

    default:
      return colors.textSecondary;
  }
};

const getAvatarColor = (name: string, colors: ThemeColors): string => {
  if (!name) {
    return colors.primary;
  }

  const firstChar = name.charAt(0).toUpperCase();

  const avatarColors = [
    colors.primary,
    colors.success,
    colors.info,
    colors.accentPurple,
    colors.accentOrange,
  ];

  const index = firstChar.charCodeAt(0) % avatarColors.length;

  return avatarColors[index];
};

const getAvatar = (name?: string): string => {
  if (!name) {
    return '?';
  }

  return name.charAt(0).toUpperCase();
};

export const mapUserStoriesToColumns = (
  userStories: UserStory[],
  strings: StringsType,
  colors: ThemeColors,
): KanbanColumn[] => {
  const columns: KanbanColumn[] = [
    {
      title: strings.projectDetails?.toDo || 'TO DO',
      color: colors.textSecondary,
      userStories: [],
    },
    {
      title: strings.projectDetails?.inProgress || 'IN PROGRESS',
      color: colors.primary,
      userStories: [],
    },
    {
      title: strings.projectDetails?.inReview || 'IN REVIEW',
      color: colors.accentPurple,
      userStories: [],
    },
    {
      title: strings.projectDetails?.done || 'DONE',
      color: colors.success,
      userStories: [],
    },
    {
      title: strings.projectDetails?.testing || 'TESTING',
      color: colors.accentOrange,
      userStories: [],
    },
    {
      title: strings.projectDetails?.blocked || 'BLOCKED',
      color: colors.info,
      userStories: [],
    },
  ];

  const statusToColumn: Record<string, number> = {
    todo: 0,
    'to do': 0,
    planning: 0,

    in_progress: 1,
    'in progress': 1,

    in_review: 2,
    'in review': 2,

    completed: 3,
    complete: 3,
    done: 3,

    testing: 4,

    blocked: 5,
  };

  userStories?.forEach(userStory => {
    const status = userStory.status?.trim().toLowerCase();

    const columnIndex = statusToColumn[status];

    if (columnIndex === undefined) {
      console.warn(
        `Unknown user story status "${userStory.status}" for user story ${userStory.id}`,
      );
      return;
    }

    const mappedTasks: Task[] =
      userStory.tasks?.map(task => ({
        id: task.id,
        title: task.title,
        priority: getPriorityColor(task.priority, colors),
        points: `${task.story_points ?? 0}p`,
        avatar: getAvatar(task.assignee_name || task.reporter_name),
        avatarColor: getAvatarColor(
          task.assignee_name || task.reporter_name,
          colors,
        ),
        status: task.status,
      })) ?? [];

    columns[columnIndex].userStories.push({
      id: userStory.id,
      title: userStory.title,
      status: userStory.status,
      statusColor: userStory.status_color || columns[columnIndex].color,
      points: `${userStory.story_points ?? 0}p`,
      progress: userStory.progress ?? 0,
      totalTasks: userStory.total_tasks ?? mappedTasks.length,
      completedTasks: userStory.completed_tasks ?? 0,
      tasks: mappedTasks,
    });
  });

  return columns;
};
