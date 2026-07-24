import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import AppText from '../components/common/AppText';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';

import { Issue } from '../data/backlogData';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

interface Props {
  issue: Issue;
  onPress?: () => void;
}

const IssueRow = ({ issue, onPress }: Props) => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  // Dynamic type badges driven by standard system colors or fallbacks
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
      onPress={onPress}
      className='flex-row items-center border-b'
      style={{
        backgroundColor: colors.card || colors.background,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.paddingHorizontal / 1.2,
      }}
    >
      {/* Issue Type Indicator */}
      <View
        className='items-center justify-center rounded-sm'
        style={{
          width: moderateScale(20),
          height: moderateScale(20),
          backgroundColor: badgeColor,
        }}
      >
        <AppText
          variant='caption'
          color={colors.white}
          className='text-[10px] font-bold'
        >
          {badgeLetter}
        </AppText>
      </View>

      {/* Title */}
      <View className='flex-1' style={{ marginLeft: layout.elementGap }}>
        <AppText variant='body' color={colors.text} numberOfLines={1}>
          {issue.title}
        </AppText>
      </View>

      {/* Status Badge */}
      <StatusBadge status={issue.status} />

      {/* Story Points Badge */}
      <View
        className='items-center justify-center rounded-md'
        style={{
          marginLeft: layout.tightGap,
          minWidth: moderateScale(28),
          paddingHorizontal: layout.tightGap,
          paddingVertical: layout.tightGap / 2,
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

      {/* Assignee Avatar */}
      <View style={{ marginLeft: layout.elementGap }}>
        <Avatar initials={issue.assignee} color={issue.assigneeColor} />
      </View>
    </TouchableOpacity>
  );
};

export default IssueRow;
