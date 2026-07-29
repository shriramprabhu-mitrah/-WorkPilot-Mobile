import Toast from 'react-native-toast-message';

// export const API_URL =
//   'https://cf27-2405-201-e019-c0-b495-360b-134a-b237.ngrok-free.app/api/v1';

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

export const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};
