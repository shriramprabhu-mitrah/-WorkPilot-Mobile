import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from '../components/common/AppText';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { Issue } from '../data/backlogData';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
  issue: Issue;
  onPress?: () => void;
}

const IssueRow = ({ issue }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const issueTypeColors: Record<string, string> = {
    Story: colors.success || '#36B37E',
    Task: colors.primary || '#0052CC',
    Bug: colors.error || '#DE350B',
    Epic: colors.accentPurple || '#6554C0',
  };
  const issueTypeLetters: Record<string, string> = {
    Story: 'S',
    Task: 'T',
    Bug: 'B',
    Epic: 'E',
  };
  const badgeColor = issueTypeColors[issue.type] || colors.primary;
  const badgeLetter =
    issueTypeLetters[issue.type] || issue.type?.charAt(0) || 'I';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('issue', { id: issue.id })}
      className='flex-row items-center border-b'
      style={{
        backgroundColor: colors.card || colors.background,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        gap: layout.sectionGap * 1.5,
      }}
    >
      <View
        className='items-center justify-center rounded-sm'
        style={{
          width: layout.iconSize,
          height: layout.iconSize,
          backgroundColor: badgeColor,
        }}
      >
        <AppText variant='caption' color={colors.white} className='font-bold'>
          {badgeLetter}
        </AppText>
      </View>
      <View className='flex-1'>
        <AppText variant='body' color={colors.text} numberOfLines={1}>
          {issue.title}
        </AppText>
      </View>
      <StatusBadge status={issue.status} />
      <View
        className='items-center justify-center'
        style={{
          width: moderateScale(20),
          height: moderateScale(20),
          borderRadius: Radius.circle,
          backgroundColor: colors.surface || colors.background,
        }}
      >
        <AppText
          variant='caption'
          color={colors.textSecondary}
          className='font-semibold'
        >
          {issue.points}
        </AppText>
      </View>
      <View>
        <Avatar initials={issue.assignee} color={issue.assigneeColor} />
      </View>
    </TouchableOpacity>
  );
};

export default IssueRow;
