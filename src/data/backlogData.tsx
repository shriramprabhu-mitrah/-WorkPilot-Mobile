import { ThemeColors } from '../constants/Colors';

export type IssueStatus = 'To Do' | 'In Progress' | 'Done';

export interface Issue {
  id: string;
  title: string;
  type: 'Story' | 'Task' | 'Bug' | 'Epic';
  status: IssueStatus;
  points: number;
  assignee?: string;
  assigneeColor?: string;
}

export interface Sprint {
  id: string;
  title: string;
  active?: boolean;
  date: string;
  issues: Issue[];
}

export const getBacklogData = (colors: ThemeColors): Sprint[] => [
  {
    id: '1',
    title: 'Sprint 14',
    active: true,
    date: 'Jul 8 – Jul 22, 2025',
    issues: [
      {
        id: 'SPR-1',
        title: 'OAuth token refresh failing after session timeout',
        type: 'Story',
        status: 'In Progress',
        points: 5,
        assignee: 'AJ',
        assigneeColor: colors.primary,
      },
      {
        id: 'SPR-2',
        title: 'Migrate auth service to new API',
        type: 'Task',
        status: 'In Progress',
        points: 13,
        assignee: 'MK',
        assigneeColor: colors.accentOrange,
      },
      {
        id: 'SPR-3',
        title: 'Implement zero-downtime deployment',
        type: 'Story',
        status: 'To Do',
        points: 8,
        assignee: 'SR',
        assigneeColor: colors.success,
      },
      {
        id: 'SPR-4',
        title: 'Fix memory leak in health check',
        type: 'Bug',
        status: 'To Do',
        points: 3,
        assignee: 'AJ',
        assigneeColor: colors.primary,
      },
    ],
  },

  {
    id: '2',
    title: 'Sprint 15',
    active: false,
    date: 'Jul 22 – Aug 5, 2025',
    issues: [
      {
        id: 'SPR-5',
        title: 'Add rate limiting to public API',
        type: 'Story',
        status: 'To Do',
        points: 8,
      },
      {
        id: 'SPR-6',
        title: 'Configure Terraform modules',
        type: 'Task',
        status: 'To Do',
        points: 5,
      },
      {
        id: 'SPR-7',
        title: 'Improve error messages for Auth',
        type: 'Story',
        status: 'To Do',
        points: 3,
      },
    ],
  },

  {
    id: '3',
    title: 'Backlog',
    active: false,
    date: '',
    issues: [
      {
        id: 'SPR-8',
        title: 'Multi-region deployment support',
        type: 'Epic',
        status: 'To Do',
        points: 21,
      },
      {
        id: 'SPR-9',
        title: 'Real-time collaboration',
        type: 'Story',
        status: 'To Do',
        points: 13,
      },
      {
        id: 'SPR-10',
        title: 'Refactor legacy authentication',
        type: 'Task',
        status: 'To Do',
        points: 8,
      },
      {
        id: 'SPR-11',
        title: 'Race condition in concurrent requests',
        type: 'Bug',
        status: 'To Do',
        points: 5,
      },
    ],
  },
];
