import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/homeScreen';
import ProjectsScreen from '../screens/projectScreen';
import SearchScreen from '../screens/searchScreen';
import ProfileScreen from '../screens/profileScreen';

import CustomTabBar from '../navigation/CustomTabBar';

export type BottomTabParamList = {
  Home: undefined;
  Projects: undefined;
  Search: undefined;
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
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Projects' component={ProjectsScreen} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
