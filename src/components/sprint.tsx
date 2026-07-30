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
import { Radius } from '../constants/Radius';

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
      style={{
        backgroundColor: colors.card || colors.background,
        marginBottom: layout.sectionGap,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleSection}
        className='flex-row items-center justify-between'
        style={{
          paddingHorizontal: layout.paddingHorizontal * 0.75,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        <View
          className='flex-1 flex-row flex-wrap items-center'
          style={{ gap: layout.elementGap }}
        >
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
          {sprint.active && (
            <View
              style={{
                borderRadius: Radius.circle,
                backgroundColor: colors.info ? `${colors.info}20` : '#DBEAFE',
                paddingHorizontal: layout.paddingHorizontal * 0.25,
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
          <AppText
            variant='caption'
            color={colors.textSecondary}
            style={{ marginLeft: layout.tightGap }}
          >
            ({sprint.issues.length}{' '}
            {strings.sprintSection?.issuesLabel || 'issues'})
          </AppText>
        </View>
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
      <View style={{ height: 1, backgroundColor: colors.border }} />
      {expanded && (
        <>
          {sprint.issues.map((issue: any) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate('newIssues')}
            activeOpacity={0.8}
            className='flex-row items-center'
            style={{
              paddingHorizontal: layout.paddingHorizontal * 0.75,
              paddingTop: layout.paddingTop,
              paddingBottom: layout.paddingBottom,
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
