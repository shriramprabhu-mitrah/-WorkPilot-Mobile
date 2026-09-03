import Ionicons from '@react-native-vector-icons/ionicons';
import Strings, { StringsType } from '../constants/textConfig';
import { ThemeColors } from '../constants/Colors';
import { UserInsights } from '../types/home.type';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const getStats = (colors: ThemeColors, insights: UserInsights) => [
  {
    label: Strings.profile?.assigned || 'Assigned',
    value: insights?.total_assigned ?? 0,
    color: colors.primary,
  },
  {
    label: Strings.profile?.in_progress || 'In Progress',
    value: insights?.in_progress ?? 0,
    color: colors.success,
  },
  {
    label: Strings.profile?.completed || 'Completed',
    value: insights?.completed ?? 0,
    color: colors.accentPurple,
  },
  {
    label: Strings.profile?.completion_percentage || 'Completion %',
    value: `${insights?.completion_percentage ?? 0} %`,
    color: colors.info,
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
    label: strings.profile?.favorites || 'Favorites',
    iconName: (strings.profile?.icons?.starred ||
      'star-outline') as IoniconName,
    color: colors.warning,
    navigateUrl: 'Favorites',
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
