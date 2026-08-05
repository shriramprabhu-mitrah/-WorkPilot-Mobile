import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import LoginScreen from '../screens/login';
import SignUpScreen from '../screens/signUp';
import VerifyEmailScreen from '../screens/verifyEmail';
import ForgotPassword from '../screens/forgetPassword';
import ResetPassword from '../screens/resetPassword';
import TabNavigator from './tabNavigator';
import { useAppSelector } from '../store';
import issueDetailsScreen from '../screens/IssuesDetailScreen';
import projectDeatilsScreen from '../screens/projectsDetailScreen';
import BackLog from '../screens/backlog';
import SettingsScreen from '../screens/settingsScreen';
import AddNewIssues from '../screens/addNewIssues';
import { NavigationContainer } from '@react-navigation/native';
import UpdateUserDetailsScreen from '../screens/updateUserDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  console.log('isAuthenticated:', isAuthenticated);
  // const isAuthenticated = true;
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            // animation: 'reveal_from_bottom',
          }}
          initialRouteName='HomeTabs'
        >
          <Stack.Screen name='HomeTabs' component={TabNavigator} />
          <Stack.Screen name='issue' component={issueDetailsScreen} />
          <Stack.Screen
            name='projectDetails'
            component={projectDeatilsScreen}
          />
          <Stack.Screen name='BackLogs' component={BackLog} />
          <Stack.Screen name='Settings' component={SettingsScreen} />
          <Stack.Screen name='newIssues' component={AddNewIssues} />
          <Stack.Screen
            name='updateDetails'
            component={UpdateUserDetailsScreen}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName='login'
          screenOptions={{
            headerShown: false,
            // animation: 'fade',
          }}
        >
          <Stack.Screen name='login' component={LoginScreen} />
          <Stack.Screen name='signUp' component={SignUpScreen} />
          <Stack.Screen name='verifyEmail' component={VerifyEmailScreen} />
          <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
          <Stack.Screen name='resetPassword' component={ResetPassword} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
