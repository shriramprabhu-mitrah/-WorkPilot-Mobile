export interface CustomDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  content?: string | React.ReactNode;
  iconName?: string;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  showCloseIcon?: boolean;
}
