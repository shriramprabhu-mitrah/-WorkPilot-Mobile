import { LightColors } from '../constants/Colors';
import { useTheme } from '../theme/ThemeProvider';

const { colors } = useTheme();

export const projects = [
  { id: 'CLOUD', icon: 'C', color: colors.primary },
  { id: 'MOB', icon: 'M', color: colors.accentPurple },
  { id: 'API', icon: 'A', color: colors.accentOrange },
  { id: 'DESIGN', icon: 'D', color: colors.success },
];

export const issueTypes = [
  { id: 'Story', icon: 'S', color: colors.success },
  { id: 'Bug', icon: 'B', color: colors.error },
  { id: 'Task', icon: 'T', color: colors.primary },
  { id: 'Epic', icon: 'E', color: colors.accentPurple },
  { id: 'Subtask', icon: 'S', color: colors.secondary },
];

export const priorities = [
  { type: 'Highest', color: colors.error },
  { type: 'High', color: colors.accentOrange },
  { type: 'Medium', color: colors.warning },
  { type: 'Low', color: colors.info },
  { type: 'Lowest', color: colors.textSecondary },
];

export const assignees = ['Unassigned', 'AJ', 'MK', 'SR', 'JL'];

export const storyPoints = ['1', '2', '3', '5', '8', '13', '21'];
