import React from 'react';
import { View } from 'react-native';

import AppText from '../components/common/AppText';
import { IssueStatus } from '../data/backlogData';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

interface Props {
  status: IssueStatus;
}

const StatusBadge = ({ status }: Props) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  // Dynamic theme-based styles for status states
  const statusStyles: Record<IssueStatus, { bg: string; text: string }> = {
    'To Do': {
      bg: colors.surface || colors.border,
      text: colors.textSecondary,
    },
    'In Progress': {
      bg: colors.info ? `${colors.info}20` : '#DEEBFF',
      text: colors.info || colors.primary,
    },
    Done: {
      bg: colors.success ? `${colors.success}20` : '#E3FCEF',
      text: colors.success,
    },
  };

  const currentStyle = statusStyles[status] || statusStyles['To Do'];

  return (
    <View
      className='items-center justify-center rounded-full'
      style={{
        backgroundColor: currentStyle.bg,
        paddingHorizontal: layout.tightGap * 1.5,
        paddingVertical: layout.tightGap / 1.5,
      }}
    >
      <AppText
        variant='caption'
        color={currentStyle.text}
        className='text-[12px] font-medium'
      >
        {status}
      </AppText>
    </View>
  );
};

export default StatusBadge;
