import React from 'react';
import { ToastConfig } from 'react-native-toast-message';
import CustomToast from '../components/common/Toast/CustomToast';

export const toastConfig: ToastConfig = {
  success: props => <CustomToast {...props} type='success' />,

  error: props => <CustomToast {...props} type='error' />,
};
