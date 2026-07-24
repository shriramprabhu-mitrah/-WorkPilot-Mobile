import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  review,
  done,
  todo,
  progress,
  recentProjects,
} from '../data/projectDetailScreenData';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ProjectDeatailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const projectId = route.params?.id;
  const project = recentProjects.find(p => p.id === projectId);

  // Column definitions using theme colors and fallback strings
  const columns = [
    {
      title: strings.projectDetails?.toDo || 'TO DO',
      color: colors.textSecondary,
      tasks: todo,
    },
    {
      title: strings.projectDetails?.inProgress || 'IN PROGRESS',
      color: colors.primary,
      tasks: progress,
    },
    {
      title: strings.projectDetails?.inReview || 'IN REVIEW',
      color: colors.accentPurple || '#6D5BD0',
      tasks: review,
    },
    {
      title: strings.projectDetails?.done || 'DONE',
      color: colors.success,
      tasks: done,
    },
  ];

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: layout.largeSectionGap * 2 }}
      >
        {/* Header Banner */}
        <View
          style={{
            backgroundColor: project?.color || colors.primary,
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.paddingTop,
            paddingBottom: layout.sectionGap,
          }}
        >
          {/* Top Bar Actions */}
          <View className='flex-row items-center justify-between'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('HomeTabs', { screen: 'Projects' })
              }
            >
              <Ionicons name='arrow-back' size={22} color={colors.white} />
            </TouchableOpacity>

            <View className='flex-row gap-3'>
              <TouchableOpacity
                activeOpacity={0.8}
                className='items-center justify-center rounded-full bg-white/20'
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                }}
              >
                <Ionicons
                  name='funnel-outline'
                  size={18}
                  color={colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                className='items-center justify-center rounded-full bg-white/20'
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                }}
              >
                <Ionicons
                  name='ellipsis-horizontal'
                  size={18}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Project Details */}
          <View style={{ marginTop: layout.elementGap }}>
            <AppText variant='h2' color={colors.white}>
              {project?.name ||
                strings.projectDetails?.defaultTitle ||
                'Project'}
            </AppText>

            <AppText
              variant='body'
              color={colors.textOnPrimary}
              style={{ marginTop: layout.tightGap / 2 }}
            >
              {project?.type || 'Software project'} ·{' '}
              {strings.projectDetails?.softwareType || 'Software project'}
            </AppText>

            {/* Sprint Tag */}
            <View
              className='flex-row items-center self-start rounded-full bg-white/20'
              style={{
                paddingHorizontal: layout.paddingHorizontal / 1.5,
                paddingVertical: layout.tightGap,
                marginTop: layout.elementGap,
              }}
            >
              <View
                className='rounded-full'
                style={{
                  width: moderateScale(8),
                  height: moderateScale(8),
                  backgroundColor: colors.success,
                  marginRight: layout.tightGap,
                }}
              />
              <AppText
                variant='caption'
                color={colors.white}
                className='font-semibold'
              >
                {strings.projectDetails?.sprintInfo ||
                  'Sprint 14 · 6 days left'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View
          className='flex-row border-b'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            className='flex-1 border-b-2 py-3'
            style={{ borderColor: colors.primary }}
          >
            <AppText
              variant='bodyLarge'
              color={colors.primary}
              className='text-center font-bold'
            >
              {strings.projectDetails?.boardTab || 'Board'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BackLogs')}
            className='flex-1 py-3'
          >
            <AppText
              variant='bodyLarge'
              color={colors.textSecondary}
              className='text-center font-semibold'
            >
              {strings.projectDetails?.backlogTab || 'Backlog'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Kanban Board Columns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.elementGap,
          }}
        >
          {columns.map(column => (
            <View
              key={column.title}
              style={{
                width: moderateScale(280),
                marginRight: layout.elementGap,
              }}
            >
              {/* Column Header */}
              <View className='mb-3 flex-row items-center justify-between'>
                <View className='flex-row items-center'>
                  <View
                    className='rounded-full'
                    style={{
                      width: moderateScale(10),
                      height: moderateScale(10),
                      backgroundColor: column.color,
                      marginRight: layout.tightGap,
                    }}
                  />
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-bold'
                  >
                    {column.title}
                  </AppText>

                  <View
                    className='rounded-full px-2 py-0.5'
                    style={{
                      backgroundColor: colors.surface,
                      marginLeft: layout.tightGap,
                    }}
                  >
                    <AppText variant='caption' color={colors.textSecondary}>
                      {column.tasks.length}
                    </AppText>
                  </View>
                </View>

                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name='add' size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Task Cards */}
              {column.tasks.map(item => (
                <TaskCard key={item.id} item={item} />
              ))}

              {/* Add Issue Button for TO DO */}
              {column.title === (strings.projectDetails?.toDo || 'TO DO') && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('newIssues')}
                  className='mt-2 items-center justify-center rounded-lg border-2 border-dashed py-3'
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                >
                  <AppText variant='body' color={colors.textSecondary}>
                    + {strings.projectDetails?.addIssue || 'Add issue'}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
};

export default ProjectDeatailsScreen;
