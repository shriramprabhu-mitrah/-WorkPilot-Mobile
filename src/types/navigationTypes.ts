import { NavigatorScreenParams } from '@react-navigation/native';
import { Task, UserStory } from './project.type';
import { Activity } from './home.type';

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
    | {
        id?: string;
        projectId?: string;
        userStoryId?: string;
        taskId?: string;
        story?: UserStory | Activity;
        task?: Task | Activity;
        fromUserStory?: boolean;
        storyName?: string;
        taskName?: string;
      }
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
  loginScreen: undefined;
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
