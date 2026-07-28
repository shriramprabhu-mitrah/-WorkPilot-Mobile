import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';

const { colors } = useTheme();

export type NotificationDataType = {
  id: number;
  type: string;
  read: boolean;
  time: string;
  avatar: string;
  color: string;
  actor: string;
  action: string;
  target: string;
  preview: string;
  issueId: string;
};

export const notificationsData: NotificationDataType[] = [
  {
    id: 1,
    type: 'mention',
    read: false,
    time: '2 min ago',
    avatar: 'MK',
    color: colors.primary,
    actor: 'Maya Kim',
    action: 'mentioned you in',
    target: 'CLOUD-330',
    preview:
      'Looking at the auth service logs, @alex the token TTL might be causing the refresh issue.',
    issueId: 'CLOUD-330',
  },
  {
    id: 2,
    type: 'assigned',
    read: false,
    time: '1 hour ago',
    avatar: 'SR',
    color: colors.error,
    actor: 'Sam Rivera',
    action: 'assigned you to',
    target: 'API-72',
    preview: 'Update OpenAPI spec for v3 endpoints',
    issueId: 'API-72',
  },
  {
    id: 3,
    type: 'comment',
    read: false,
    time: '2 hours ago',
    avatar: 'JL',
    color: colors.success,
    actor: 'Jordan Lee',
    action: 'commented on',
    target: 'MOB-128',
    preview:
      'The push notification service is ready for testing on both iOS and Android.',
    issueId: 'MOB-128',
  },
  {
    id: 4,
    type: 'status',
    read: true,
    time: 'Yesterday',
    avatar: 'MK',
    color: colors.primary,
    actor: 'Maya Kim',
    action: 'moved',
    target: 'DS-14',
    preview: 'Design token audit → In Review',
    issueId: 'DS-14',
  },
  {
    id: 5,
    type: 'mention',
    read: true,
    time: 'Yesterday',
    avatar: 'SR',
    color: colors.error,
    actor: 'Sam Rivera',
    action: 'mentioned you in',
    target: 'CLOUD-302',
    preview: '@alex can you review the Terraform plan before we apply?',
    issueId: 'CLOUD-302',
  },
  {
    id: 6,
    type: 'assigned',
    read: true,
    time: '2 days ago',
    avatar: 'JL',
    color: colors.success,
    actor: 'Jordan Lee',
    action: 'assigned you to',
    target: 'MOB-100',
    preview: 'Offline mode support implementation',
    issueId: 'MOB-100',
  },
  {
    id: 7,
    type: 'review',
    read: true,
    time: '2 days ago',
    avatar: 'MK',
    color: colors.primary,
    actor: 'Maya Kim',
    action: 'requested review on',
    target: 'API-67',
    preview: 'Rate limiting documentation updates ready for review',
    issueId: 'API-67',
  },
];

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const typeIcons: Record<string, { icon: IoniconName }> = {
  mention: { icon: 'at' },
  assigned: { icon: 'arrow-forward' },
  comment: { icon: 'reader' },
  status: { icon: 'arrow-up-sharp' },
  review: { icon: 'eye' },
};
