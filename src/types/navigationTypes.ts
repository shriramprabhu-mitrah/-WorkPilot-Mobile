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
        userStroyName?: string;
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
  Favorites: undefined;
};

export type ProjectTopTabParamList = {
  Summary: { projectId: string; sprintId?: string } | undefined;
  Board: { projectId: string; sprintId?: string } | undefined;
  List: { projectId: string; sprintId?: string } | undefined;
  Backlogs: { projectId: string; sprintId?: string } | undefined;
  Settings: { projectId: string; sprintId?: string } | undefined;
  Report: { projectId: string; sprintId?: string } | undefined;
  Calendar: { projectId: string; sprintId?: string } | undefined;
};
