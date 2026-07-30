import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import TaskCard from '../components/TaskCard';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { getColumns, recentProjects } from '../data/projectDetailScreenData';
import { Radius } from '../constants/Radius';

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'projectDetails'>;

const ProjectDeatailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const projectId = route.params?.id;
  const project = recentProjects.find(p => p.type === projectId);
  const columns = getColumns(strings);
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        <View
          style={{
            backgroundColor: project?.color || colors.primary,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
          }}
        >
          <View className='flex-row items-center justify-between'>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('HomeTabs', { screen: 'Projects' })
              }
            >
              <Ionicons
                name='arrow-back'
                size={layout.iconSize * 1.25}
                color={colors.white}
              />
            </TouchableOpacity>

            <View className='flex-row' style={{ gap: layout.sectionGap }}>
              <TouchableOpacity
                activeOpacity={0.8}
                className='items-center justify-center'
                style={{
                  borderRadius: Radius.circle,
                  backgroundColor: `${colors.white}2A`,
                  width: layout.iconSize * 2,
                  height: layout.iconSize * 2,
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
                className='items-center justify-center'
                style={{
                  borderRadius: Radius.circle,
                  backgroundColor: `${colors.white}2A`,
                  width: layout.iconSize * 2,
                  height: layout.iconSize * 2,
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
          <View style={{ gap: layout.tightGap }}>
            <AppText variant='title' color={colors.white} className='font-bold'>
              {project?.name ||
                strings.projectDetails?.defaultTitle ||
                'Project'}
            </AppText>
            <AppText
              variant='body'
              color={colors.white}
              className='font-semibold'
            >
              {project?.type || 'Software project'} ·{' '}
              {strings.projectDetails?.softwareType || 'Software project'}
            </AppText>
            <View
              className='flex-row items-center self-start'
              style={{
                marginVertical: layout.sectionGap,
                borderRadius: Radius.circle,
                backgroundColor: `${colors.white}2A`,
                paddingHorizontal: layout.paddingHorizontal * 0.5,
                paddingTop: layout.paddingTop * 0.5,
                paddingBottom: layout.paddingBottom * 0.5,
                gap: layout.elementGap,
              }}
            >
              <View
                style={{
                  borderRadius: Radius.circle,
                  width: moderateScale(8),
                  height: moderateScale(8),
                  backgroundColor: colors.success,
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
        <View
          className='flex-row border-b'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            className='flex-1 border-b-2'
            style={{
              borderColor: colors.primary,
              paddingVertical: layout.elementGap,
            }}
          >
            <AppText
              variant='body'
              color={colors.primary}
              className='text-center font-bold'
            >
              {strings.projectDetails?.boardTab || 'Board'}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BackLogs')}
            className='flex-1'
            style={{
              paddingVertical: layout.elementGap,
            }}
          >
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='text-center font-semibold'
            >
              {strings.projectDetails?.backlogTab || 'Backlog'}
            </AppText>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.tightGap,
          }}
        >
          {columns.map(column => (
            <View
              key={column.title}
              style={{
                width: moderateScale(280),
                paddingRight: layout.elementGap,
                gap: layout.tightGap,
              }}
            >
              <View
                className='flex-row items-center justify-between'
                style={{
                  paddingHorizontal: layout.paddingHorizontal * 0.25,
                  paddingTop: layout.paddingTop,
                  paddingBottom: layout.paddingBottom,
                }}
              >
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.sectionGap }}
                >
                  <View
                    style={{
                      borderRadius: Radius.circle,
                      width: moderateScale(10),
                      height: moderateScale(10),
                      backgroundColor: column.color,
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
                    style={{
                      backgroundColor: colors.border,
                      paddingHorizontal: layout.paddingHorizontal * 0.25,
                      borderRadius: Radius.circle,
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
              <View style={{ gap: layout.elementGap }}>
                {column.tasks.map(item => (
                  <TaskCard key={item.id} item={item} />
                ))}
                {column.title === (strings.projectDetails?.toDo || 'TO DO') && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('newIssues')}
                    className='items-center justify-center border-2 border-dashed'
                    style={{
                      borderRadius: Radius.sm,
                      paddingTop: layout.paddingTop,
                      paddingBottom: layout.paddingBottom,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText variant='body' color={colors.textSecondary}>
                      + {strings.projectDetails?.addIssue || 'Add issue'}
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
};

export default ProjectDeatailsScreen;
