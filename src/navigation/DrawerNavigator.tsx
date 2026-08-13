import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
// import TabNavigator from './tabNavigator';
import Home from '../screens/Home';
import { CustomDrawerContent } from '../components/DrawerComponent';
import ProfileScreen from '../screens/profileScreen';
import NotificationsScreen from '../screens/notificationScreen';
import SettingsScreen from '../screens/settingsScreen';

export type DrawerParamList = {
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  Teams: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
      }}
    >
      {/* <Drawer.Screen name='MainTabs' component={TabNavigator} /> */}
      <Drawer.Screen name='MainTabs' component={Home} />
      <Drawer.Screen name='Profile' component={ProfileScreen} />
      {/* <Drawer.Screen name='Teams' component={TeamsScreen} /> */}
      <Drawer.Screen name='Notifications' component={NotificationsScreen} />
      <Drawer.Screen name='Settings' component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
