import Toast from 'react-native-toast-message';

export const API_URL = 'https://workpilot-backend-arxt.onrender.com/api/v1';

export const showSuccessToast = (message: string, type: string) => {
  Toast.show({
    type: type,
    text1: `${type === 'success' ? 'Success' : 'Error'}`,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Swipe and drag to track, prioritize, and filter on the go.',
    subtitle:
      'Stay on top of all team activities with real-time updates and clear metrics.',
    animationSource: require('../assets/animations/onBoarding1.json'),
  },
  {
    id: '2',
    title: 'Collaborate effortlessly across distributed teams.',
    subtitle:
      'Share insights, assign tasks, and maintain seamless communication.',
    animationSource: require('../assets/animations/onBoarding2.json'),
  },
  {
    id: '3',
    title: 'Manage agile workflows with custom boards.',
    subtitle: 'Visualize progress with drag-and-drop Kanban and Scrum boards.',
    animationSource: require('../assets/animations/onBoarding3.json'),
  },
  {
    id: '4',
    title: 'Automate repetitive processes instantly.',
    subtitle:
      'Set up custom rules to auto-assign tasks and trigger instant notifications.',
    animationSource: require('../assets/animations/onBoarding4.json'),
  },
  {
    id: '5',
    title: 'Welcome to WorkPilot, your ultimate work companion.',
    subtitle:
      'You are all set! Step into your workspace and start piloting your projects.',
    animationSource: require('../assets/animations/onBoarding5.json'),
  },
];

export const SIGN_UP =
  'https://workpilot-frontend-4vak.onrender.com/signup?source=mobile';

export const LOGIN_URL =
  'https://workpilot-frontend-4vak.onrender.com/signin?source=mobile';
