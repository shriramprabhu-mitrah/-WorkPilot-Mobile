import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';

import { RootStackParamList } from '../types/navigationTypes';
import HomeScreen from '../screens/homeScreen';
import ProfileScreen from '../screens/profileScreen';
import SearchScreen from '../screens/searchScreen';
import NotificationsScreen from '../screens/notificationScreen';
import ProjectScreen from '../screens/projectScreen';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  // Responsive sizing calculations derived from layout hook
  const iconSize = layout.iconSize * 0.9; // Scales smoothly across devices
  const tabBarHeight = Platform.OS === 'ios' ? 84 : 64;

  return (
    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary || colors.placeholder,
        tabBarStyle: {
          backgroundColor: colors.card || colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8, // Elevation shadow for Android
          shadowColor: colors.text, // Subtle top shadow for iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: layout.captionFontSize || 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          tabBarLabel: strings?.tabs?.home || 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Projects'
        component={ProjectScreen}
        options={{
          tabBarLabel: strings?.tabs?.projects || 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'folder-open' : 'folder-open-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Search'
        component={SearchScreen}
        options={{
          tabBarLabel: strings?.tabs?.search || 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Inbox'
        component={NotificationsScreen}
        options={{
          tabBarLabel: strings?.tabs?.inbox || 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name='You'
        component={ProfileScreen}
        options={{
          tabBarLabel: strings?.tabs?.you || 'You',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
