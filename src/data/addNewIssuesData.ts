import { useTheme } from '../theme/ThemeProvider';

const { colors } = useTheme();

export interface ProjectItem {
  id: string;
  icon: string;
  color?: string;
}

export interface IssueTypeItem {
  id: string;
  icon: string;
  color?: string;
}

export interface PriorityItem {
  type: string;
  color: string;
}

export interface AssigneeItem {
  title: string;
  color: string;
}

export type StoryPoint = string;

export const projects: ProjectItem[] = [
  { id: 'CLOUD', icon: 'C', color: colors.primary },
  { id: 'MOB', icon: 'M', color: colors.accentPurple },
  { id: 'API', icon: 'A', color: colors.accentOrange },
  { id: 'DS', icon: 'D', color: colors.success },
];

export const issueTypes: IssueTypeItem[] = [
  { id: 'Story', icon: 'S', color: colors.success },
  { id: 'Bug', icon: 'B', color: colors.error },
  { id: 'Task', icon: 'T', color: colors.primary },
  { id: 'Epic', icon: 'E', color: colors.accentPurple },
  { id: 'Subtask', icon: 'S', color: colors.secondary },
];

export const priorities: PriorityItem[] = [
  { type: 'Highest', color: colors.error },
  { type: 'High', color: colors.accentOrange },
  { type: 'Medium', color: colors.warning },
  { type: 'Low', color: colors.info },
  { type: 'Lowest', color: colors.textSecondary },
];

export const assignees = ['Unassigned', 'AJ', 'MK', 'SR', 'JL'];

export const storyPoints = ['1', '2', '3', '5', '8', '13', '21'];
