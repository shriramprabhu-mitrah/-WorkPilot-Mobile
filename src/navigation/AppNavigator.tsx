import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import SignUpScreen from '../screens/signUp';
import VerifyEmailScreen from '../screens/verifyEmail';
import ForgotPassword from '../screens/forgetPassword';
import ResetPassword from '../screens/resetPassword';
import { mmkv, useAppDispatch, useAppSelector } from '../store';
import DrawerNavigator from './DrawerNavigator';
import issueDetailsScreen from '../screens/IssuesDetailScreen';
import ProjectDetails from '../screens/projectDetails';
import BackLog from '../screens/backlog';
import SettingsScreen from '../screens/settingsScreen';
import AddNewIssues from '../screens/addNewIssues';
import { NavigationContainer } from '@react-navigation/native';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import UpdateUserDetailsScreen from '../screens/updateUserDetailScreen';
import { navigationRef } from './navigationRef';
import WebLoginScreen from '../screens/WebLoginScreen';
import OnboardingScreen from '../screens/onboardingScreen';
import OnBoardingLoginScreen from '../screens/OnBoardingLoginScreen';
import { authenticateWithToken } from '../store/auth_store/reducer/auth.reducer';
import QuickAccessScreen from '../screens/QuickAccess';
import WebSignupScreen from '../screens/WebSignup';
import SearchScreen from '../screens/searchScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import CreateScreen from '../screens/Create';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const onboardingCompleted = mmkv.getBoolean('onboardingCompleted') ?? false;

  useEffect(() => {
    const handleAuthUrl = async (url: string) => {
      try {
        console.log('Deep link received:', url);

        if (!url.startsWith('workpilot://auth')) {
          return;
        }

        const parsedUrl = new URL(url);

        const token = parsedUrl.searchParams.get('token');

        if (!token) {
          console.log('No authentication token received');
          return;
        }

        console.log('Authentication token received');

        dispatch(
          authenticateWithToken({
            accessToken: token,
            refreshToken: null,
          }),
        );
      } catch (error) {
        console.error('Failed to process authentication deep link:', error);
      }
    };

    // App running / background
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    // App completely closed
    Linking.getInitialURL().then(url => {
      if (url) {
        handleAuthUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const linking = {
    prefixes: ['workpilot://'],
    config: {
      screens: {
        login: 'login',
        WebLogin: 'web-login',
        HomeTabs: 'home',
      },
    },
  };

  console.log('isAuthenticated:', isAuthenticated, onboardingCompleted);

  console.log(
    'UNAUTH NAVIGATOR:',
    onboardingCompleted ? 'login' : 'Onboarding',
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking} ref={navigationRef}>
        {isAuthenticated ? (
          <Stack.Navigator
            key='authenticated-stack'
            detachInactiveScreens={false}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name='HomeTabs' component={DrawerNavigator} />
            <Stack.Screen name='issue' component={issueDetailsScreen} />
            <Stack.Screen name='projectDetails' component={ProjectDetails} />
            <Stack.Screen name='BackLogs' component={BackLog} />
            <Stack.Screen name='Settings' component={SettingsScreen} />
            <Stack.Screen name='newIssues' component={AddNewIssues} />
            <Stack.Screen name='QuickAccess' component={QuickAccessScreen} />
            <Stack.Screen name='Search' component={SearchScreen} />
            <Stack.Screen
              name='updateDetails'
              component={UpdateUserDetailsScreen}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator
            key={onboardingCompleted ? 'login-stack' : 'onboarding-stack'}
            initialRouteName={onboardingCompleted ? 'login' : 'Onboarding'}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name='login' component={OnBoardingLoginScreen} />
            <Stack.Screen name='Onboarding' component={OnboardingScreen} />
            <Stack.Screen name='WebLogin' component={WebLoginScreen} />
            <Stack.Screen name='WebSignup' component={WebSignupScreen} />
            <Stack.Screen name='signUp' component={SignUpScreen} />
            <Stack.Screen name='verifyEmail' component={VerifyEmailScreen} />
            <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
            <Stack.Screen name='resetPassword' component={ResetPassword} />
            <Stack.Screen name='Terms' component={TermsScreen} />
            <Stack.Screen
              name='PrivacyPolicy'
              component={PrivacyPolicyScreen}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
