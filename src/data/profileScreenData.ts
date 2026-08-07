import Ionicons from '@react-native-vector-icons/ionicons';
import Strings, { StringsType } from '../constants/textConfig';
import { ThemeColors } from '../constants/Colors';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const getStats = (colors: ThemeColors, strings: StringsType) => [
  {
    label: Strings.profile?.assigned || 'Assigned',
    value: '12',
    color: colors.primary,
  },
  {
    label: strings.profile?.completed || 'Completed',
    value: '47',
    color: colors.success,
  },
  {
    label: strings.profile?.inReview || 'In Review',
    value: '3',
    color: colors.accentPurple,
  },
  {
    label: strings.profile?.overdue || 'Overdue',
    value: '2',
    color: colors.error,
  },
];

export const getRecentActivity = (colors: ThemeColors) => [
  {
    id: 1,
    action: 'Updated status on',
    target: 'CLOUD-330',
    detail: '→ In Progress',
    time: '2h ago',
    color: colors.primary,
  },
  {
    id: 2,
    action: 'Commented on',
    target: 'API-67',
    detail: '"Will have a fix by EOD"',
    time: '3h ago',
    color: colors.textSecondary,
  },
  {
    id: 3,
    action: 'Created issue',
    target: 'MOB-129',
    detail: 'Dark mode flicker on navigation',
    time: 'Yesterday',
    color: colors.success,
  },
  {
    id: 4,
    action: 'Closed',
    target: 'CLOUD-320',
    detail: 'Circuit breaker implementation',
    time: '2 days ago',
    color: colors.success,
  },
];

export const getTeams = (colors: ThemeColors) => [
  { name: 'Cloud', color: colors.primary },
  { name: 'Mobile', color: colors.accentPurple },
  { name: 'Platform', color: colors.accentOrange },
];

export type QuickLinks = {
  label?: string;
  iconName?: IoniconName;
  color?: string;
  navigateUrl?: undefined | string;
};

export const getQuickLinks = (
  colors: ThemeColors,
  strings: StringsType,
): QuickLinks[] => [
  {
    label: strings.profile?.starredIssues || 'Starred issues',
    iconName: (strings.profile?.icons?.starred ||
      'star-outline') as IoniconName,
    color: colors.warning,
    navigateUrl: 'HomeTabs',
  },
  {
    label: strings.profile?.myOpenIssues || 'My open issues',
    iconName: (strings.profile?.icons?.openIssues ||
      'checkbox-outline') as IoniconName,
    color: colors.primary,
    navigateUrl: 'HomeTabs',
  },
  {
    label: strings.profile?.settings || 'Settings',
    iconName: (strings.profile?.icons?.settings ||
      'settings-outline') as IoniconName,
    color: colors.textSecondary,
    navigateUrl: 'Settings',
  },
];
