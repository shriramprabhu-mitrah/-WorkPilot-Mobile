import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTabParamList = {
  Home: undefined;
  Project: undefined;
  Search: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  login: undefined;
  signUp: undefined;
  verifyEmail: undefined;
  ForgotPassword: undefined;
  resetPassword: undefined;
  BackLogs: undefined;
  projectDetails: { projectId: string; projectName: string } | undefined;
  issue:
    | { id?: string; projectId?: string; userStoryId?: string; taskId?: string }
    | undefined;
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
  WebLogin: undefined;
  WebSignup: undefined;
  QuickAccess: undefined;
  Create: undefined;
};

export type ProjectTopTabParamList = {
  Summary: undefined;
  Board: undefined;
  List: undefined;
  Backlogs: undefined;
  Settings: undefined;
  Report: undefined;
  Calendar: undefined;
};
