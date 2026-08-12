import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/homeScreen';
import ProjectsScreen from '../screens/projectScreen';
import SearchScreen from '../screens/searchScreen';
import ProfileScreen from '../screens/profileScreen';

import CustomTabBar from '../navigation/CustomTabBar';
import NotificationsScreen from '../screens/notificationScreen';
import Home from '../screens/Home';

export type BottomTabParamList = {
  Home: undefined;
  Project: undefined;
  Search: undefined;
  Inbox: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName='Home'
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name='Home' component={Home} />
      <Tab.Screen name='Project' component={ProjectsScreen} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name='Inbox' component={NotificationsScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
