import { ThemeColors } from '../constants/Colors';

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

export const getCreateIssueData = (colors: ThemeColors) => ({
  projects: [
    { id: 'CLOUD', icon: 'C', color: colors.primary },
    { id: 'MOB', icon: 'M', color: colors.accentPurple },
    { id: 'API', icon: 'A', color: colors.accentOrange },
    { id: 'DS', icon: 'D', color: colors.success },
  ],

  issueTypes: [
    { id: 'Story', icon: 'S', color: colors.success },
    { id: 'Bug', icon: 'B', color: colors.error },
    { id: 'Task', icon: 'T', color: colors.primary },
    { id: 'Epic', icon: 'E', color: colors.accentPurple },
    { id: 'Subtask', icon: 'S', color: colors.secondary },
  ],

  priorities: [
    { type: 'Highest', color: colors.error },
    { type: 'High', color: colors.accentOrange },
    { type: 'Medium', color: colors.warning },
    { type: 'Low', color: colors.info },
    { type: 'Lowest', color: colors.textSecondary },
  ],

  assignees: ['Unassigned', 'AJ', 'MK', 'SR', 'JL'],

  storyPoints: ['1', '2', '3', '5', '8', '13', '21'],
});
