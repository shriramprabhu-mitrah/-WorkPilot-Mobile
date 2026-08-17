import { ThemeColors } from '../constants/Colors';

export type TimeFilterOption =
  | 'Past Week'
  | 'Past 2 Weeks'
  | 'Past Month'
  | 'Past 3 Months'
  | 'Past 6 Months'
  | 'All Time';

export type StatusKey = 'toDo' | 'inProgress' | 'inReview' | 'done';
export type ActiveModalType = 'dateFilter' | 'feedback' | null;

export const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  'Past Week',
  'Past 2 Weeks',
  'Past Month',
  'Past 3 Months',
  'Past 6 Months',
  'All Time',
];

export const Y_AXIS_TICKS = [7, 6, 5, 4, 3, 2, 1, 0];

export const CHART_DATA_BY_FILTER: Record<
  TimeFilterOption,
  {
    xLabels: { date: string; x: number }[];
    toDoPath: string;
    inProgressPath: string;
    inReviewPath: string;
    donePath: string;
  }
> = {
  'Past Week': {
    xLabels: [
      { date: '06/8', x: 22 },
      { date: '07/8', x: 70 },
      { date: '08/8', x: 118 },
      { date: '09/8', x: 166 },
      { date: '10/8', x: 214 },
      { date: '11/8', x: 262 },
      { date: '12/8', x: 310 },
    ],
    toDoPath: 'M22,120 L315,60 L315,75 L22,120 Z',
    inProgressPath: 'M22,120 L315,75 L315,110 L22,125 Z',
    inReviewPath: 'M22,125 L315,110 L315,135 L22,130 Z',
    donePath: 'M22,130 L315,135 L315,155 L22,155 Z',
  },
  'Past 2 Weeks': {
    xLabels: [
      { date: '30/7', x: 22 },
      { date: '01/8', x: 70 },
      { date: '03/8', x: 118 },
      { date: '05/8', x: 166 },
      { date: '07/8', x: 214 },
      { date: '09/8', x: 262 },
      { date: '12/8', x: 310 },
    ],
    toDoPath: 'M22,100 L315,40 L315,60 L22,100 Z',
    inProgressPath: 'M22,100 L315,60 L315,100 L22,105 Z',
    inReviewPath: 'M22,105 L315,100 L315,130 L22,110 Z',
    donePath: 'M22,110 L315,130 L315,155 L22,155 Z',
  },
  'Past Month': {
    xLabels: [
      { date: '12/7', x: 22 },
      { date: '17/7', x: 70 },
      { date: '22/7', x: 118 },
      { date: '27/7', x: 166 },
      { date: '01/8', x: 214 },
      { date: '06/8', x: 262 },
      { date: '12/8', x: 310 },
    ],
    toDoPath: 'M22,90 L315,30 L315,50 L22,90 Z',
    inProgressPath: 'M22,90 L315,50 L315,95 L22,95 Z',
    inReviewPath: 'M22,95 L315,95 L315,125 L22,100 Z',
    donePath: 'M22,100 L315,125 L315,155 L22,155 Z',
  },
  'Past 3 Months': {
    xLabels: [
      { date: 'May', x: 22 },
      { date: 'Jun', x: 80 },
      { date: 'Jul', x: 150 },
      { date: 'Aug', x: 230 },
      { date: 'Current', x: 310 },
    ],
    toDoPath: 'M22,80 L315,25 L315,45 L22,80 Z',
    inProgressPath: 'M22,80 L315,45 L315,85 L22,85 Z',
    inReviewPath: 'M22,85 L315,85 L315,115 L22,90 Z',
    donePath: 'M22,90 L315,115 L315,155 L22,155 Z',
  },
  'Past 6 Months': {
    xLabels: [
      { date: 'Mar', x: 22 },
      { date: 'Apr', x: 80 },
      { date: 'May', x: 140 },
      { date: 'Jun', x: 200 },
      { date: 'Jul', x: 260 },
      { date: 'Aug', x: 310 },
    ],
    toDoPath: 'M22,70 L315,20 L315,35 L22,70 Z',
    inProgressPath: 'M22,70 L315,35 L315,75 L22,75 Z',
    inReviewPath: 'M22,75 L315,75 L315,105 L22,80 Z',
    donePath: 'M22,80 L315,105 L315,155 L22,155 Z',
  },
  'All Time': {
    xLabels: [
      { date: '16/7', x: 22 },
      { date: '20/7', x: 70 },
      { date: '25/7', x: 118 },
      { date: '29/7', x: 166 },
      { date: '03/8', x: 214 },
      { date: '08/8', x: 262 },
      { date: '12/8', x: 310 },
    ],
    toDoPath: 'M22,85 L315,20 L315,40 L22,85 Z',
    inProgressPath: 'M22,85 L315,40 L315,100 L295,120 L22,88 Z',
    inReviewPath: 'M22,88 L295,120 L315,100 L315,155 L22,90 Z',
    donePath: 'M22,90 L315,155 L315,155 L22,155 Z',
  },
};

export const getLegendItems = (
  colors: ThemeColors,
): { key: StatusKey; label: string; color: string }[] => [
  { key: 'toDo', label: 'To Do', color: colors.secondary },
  { key: 'inProgress', label: 'In Progress', color: colors.primary },
  { key: 'inReview', label: 'In Review', color: colors.accentOrange },
  { key: 'done', label: 'Done', color: colors.success },
];

export const FEEDBACK_BULLETS = [
  '• Which reports do you need?',
  '• What functionality would you like?',
  '• How does your team use reports?',
];
