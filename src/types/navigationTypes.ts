import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTabParamList = {
  Home: undefined;
  Project: undefined;
  Search: undefined;
  Inbox: undefined;
  Profile: undefined;
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
  Profile: undefined;
  Settings: undefined;
  newIssues: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  updateDetails: undefined;
  QuickAccess: undefined;
  Create: undefined;
};

export type ProjectTopTabParamList = {
  Summary: undefined;
  Board: undefined;
  List: undefined;
  Backlogs: undefined;
  Settings: undefined;
};
