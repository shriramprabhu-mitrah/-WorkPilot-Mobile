import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '../hooks/useTheme';
import { moderateScale } from '../utils/responsive';
import Summary from '../screens/projectScreens/summary';
import Board from '../screens/projectScreens/board';
import List from '../screens/projectScreens/list';
import Backlogs from '../screens/projectScreens/backlog';
import Settings from '../screens/projectScreens/setting';
import Report from '../screens/projectScreens/report';
import Calendar from '../screens/projectScreens/calender';
import { ProjectTopTabParamList } from '../types/navigationTypes';

const TopTab = createMaterialTopTabNavigator<ProjectTopTabParamList>();

const ProjectTopNavigator = () => {
  const { colors } = useTheme();

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarContentContainerStyle: {
          backgroundColor: colors.surface,
        },
        tabBarScrollEnabled: true,
        tabBarItemStyle: {
          width: 'auto',
          paddingHorizontal: moderateScale(12),
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 2,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(14),
          textTransform: 'none',
          fontWeight: '600',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <TopTab.Screen name='Summary' component={Summary} />
      <TopTab.Screen name='Board' component={Board} />
      <TopTab.Screen name='Calendar' component={Calendar} />
      <TopTab.Screen name='List' component={List} />
      <TopTab.Screen name='Report' component={Report} />
      <TopTab.Screen name='Backlogs' component={Backlogs} />
      <TopTab.Screen name='Settings' component={Settings} />
    </TopTab.Navigator>
  );
};

export default ProjectTopNavigator;
