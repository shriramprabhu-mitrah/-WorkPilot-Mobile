import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AppText from './common/AppText';
import IssueRow from './IssueRow';
import { Sprint } from '../data/backlogData';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  sprint: Sprint;
}

const SprintSection = ({ sprint }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const isBacklogSection =
    sprint.title === (strings.sprintSection?.backlogTitle || 'Backlog');

  return (
    <View
      className='mb-3'
      style={{
        backgroundColor: colors.card || colors.background,
        marginBottom: layout.elementGap,
      }}
    >
      {/* Section Header */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleSection}
        className='flex-row items-center justify-between'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.paddingHorizontal,
        }}
      >
        <View className='flex-1 flex-row flex-wrap items-center'>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color={colors.textSecondary}
          />

          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
            style={{ marginLeft: layout.tightGap }}
          >
            {sprint.title}
          </AppText>

          {/* Active Badge */}
          {sprint.active && (
            <View
              className='rounded-full px-2 py-0.5'
              style={{
                backgroundColor: colors.info ? `${colors.info}20` : '#DBEAFE',
                marginLeft: layout.tightGap,
              }}
            >
              <AppText
                variant='caption'
                color={colors.info || colors.primary}
                className='text-[10px] font-bold'
              >
                {strings.sprintSection?.activeBadge || 'ACTIVE'}
              </AppText>
            </View>
          )}

          {/* Issues Count */}
          <AppText
            variant='caption'
            color={colors.textSecondary}
            style={{ marginLeft: layout.tightGap }}
          >
            ({sprint.issues.length}{' '}
            {strings.sprintSection?.issuesLabel || 'issues'})
          </AppText>
        </View>

        {/* Date & Options */}
        <View className='flex-row items-center'>
          {sprint.date !== '' && (
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{ marginRight: layout.elementGap }}
            >
              {sprint.date}
            </AppText>
          )}

          <Ionicons
            name='ellipsis-horizontal'
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* Expanded Content */}
      {expanded && (
        <>
          {sprint.issues.map((issue: any) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}

          {/* Add Issue Action */}
          <TouchableOpacity
            onPress={() => navigation.navigate('newIssues')}
            activeOpacity={0.8}
            className='flex-row items-center'
            style={{
              paddingHorizontal: layout.paddingHorizontal,
              paddingVertical: layout.paddingHorizontal,
            }}
          >
            <Ionicons name='add' size={20} color={colors.primary} />

            <AppText
              variant='body'
              color={colors.primary}
              className='font-medium'
              style={{ marginLeft: layout.elementGap }}
            >
              {isBacklogSection
                ? strings.sprintSection?.addIssueToBacklog ||
                  'Add issue to backlog'
                : strings.sprintSection?.addIssueToSprint ||
                  'Add issue to sprint'}
            </AppText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SprintSection;
