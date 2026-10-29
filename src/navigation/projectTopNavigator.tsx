import React, { useMemo, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '../hooks/useTheme';
import { moderateScale } from '../utils/responsive';
import Summary from '../screens/projectScreens/summary';
import Board from '../screens/projectScreens/board';
import List from '../screens/projectScreens/list';
import Settings, { ViewState } from '../screens/projectScreens/setting';
import Report from '../screens/projectScreens/report';
import { ProjectTopTabParamList } from '../types/navigationTypes';
import ProjectBoardScreen from '../screens/ProjectBoardScreen';
import Backlogs from '../screens/backlog';
import ProjectDeatailsScreen from '../screens/projectsDetailScreen';
import Members from '../screens/members';

interface ProjectTopNavigatorProps {
  settingsView: ViewState;
  setSettingsView: React.Dispatch<React.SetStateAction<ViewState>>;
  activeTab?: string;
  setActiveTab?: (tabName: string) => void;
  projectName?: string;
}

const TopTab = createMaterialTopTabNavigator<ProjectTopTabParamList>();

export const ProjectTopNavigator: React.FC<ProjectTopNavigatorProps> = React.memo(({
  settingsView,
  setSettingsView,
  setActiveTab,
  projectName,
}) => {
  const { colors } = useTheme();

  const screenListeners = useMemo(
    () => ({
      tabPress: () => {
        Keyboard.dismiss();
      },
      state: (e: any) => {
        const state = e.data.state;
        if (state) {
          const activeRouteName = state.routes[state.index]?.name;
          if (activeRouteName) {
            setActiveTab?.(activeRouteName);
          }
        }
      },
    }),
    [setActiveTab],
  );

  const renderSettings = useCallback(
    (props: any) => (
      <Settings
        {...props}
        currentView={settingsView}
        setCurrentView={setSettingsView}
        projectNameValue={projectName}
      />
    ),
    [settingsView, setSettingsView, projectName],
  );

  return (
    <TopTab.Navigator
      style={{ flex: 1 }}
      screenListeners={screenListeners}
      screenOptions={{
        // Smooth parallel transition on tab clicks and swipes
        animationEnabled: true,
        lazy: false,
        sceneStyle: { flex: 1 },
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,
        // Tab bar container bottom border (Inactive/Base line)
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBarContentContainerStyle: {
          backgroundColor: colors.surface,
        },
        tabBarScrollEnabled: true,
        tabBarItemStyle: {
          width: 'auto',
          paddingHorizontal: moderateScale(15),
        },
        // Selected Tab Bottom Border (Active line)
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 2,
          bottom: -1, // Positions directly over the container's bottom border
        },
        // Active vs Inactive Label Styles
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
      <TopTab.Screen
        name='Board'
        component={ProjectDeatailsScreen}
        options={{
          swipeEnabled: false,
        }}
      />
      <TopTab.Screen
        name='List'
        component={List}
        options={{
          swipeEnabled: false,
        }}
      />
      <TopTab.Screen
        name='Report'
        component={Report}
        listeners={({ navigation }) => ({
          tabPress: () => {
            Keyboard.dismiss();
            navigation.navigate('Report');
          },
        })}
        options={{
          swipeEnabled: false,
        }}
      />
      <TopTab.Screen
        name='Backlogs'
        component={Backlogs}
        options={{
          swipeEnabled: false,
        }}
      />
      <TopTab.Screen
        name='Members'
        component={Members}
        options={{
          swipeEnabled: false,
        }}
      />
      <TopTab.Screen
        name='Settings'
        options={{
          swipeEnabled: false,
        }}
      >
        {renderSettings}
      </TopTab.Screen>
    </TopTab.Navigator>
  );
});

export default ProjectTopNavigator;
