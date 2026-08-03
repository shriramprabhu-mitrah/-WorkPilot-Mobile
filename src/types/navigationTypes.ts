import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTabParamList = {
  Home: undefined;
  Project: undefined;
  Search: undefined;
  Inbox: undefined;
  You: undefined;
};

export type RootStackParamList = {
  login: undefined;
  signUp: undefined;
  verifyEmail: undefined;
  ForgotPassword: undefined;
  resetPassword: undefined;
  BackLogs: undefined;
  projectDetails: { id: string };
  issue: { id: string };
  HomeTabs: NavigatorScreenParams<HomeTabParamList> | undefined;
  Home: undefined;
  Project: undefined;
  Search: undefined;
  Inbox: undefined;
  You: undefined;
  Settings: undefined;
  newIssues: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
};
