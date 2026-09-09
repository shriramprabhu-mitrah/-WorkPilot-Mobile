import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import CustomSnackbar, {
  CustomSnackbarProps,
  SnackbarType,
  SnackbarIconMode,
} from './CustomSnackbar';

export interface ShowSnackbarOptions {
  message: string;
  type?: SnackbarType;
  iconMode?: SnackbarIconMode;
  duration?: number;
  bottomOffset?: number;
  action?: CustomSnackbarProps['action'];
}

interface SnackbarContextType {
  showSnackbar: (options: ShowSnackbarOptions | string) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

// Global static reference to allow calling showSnackbar from outside React components
let globalShowSnackbar:
  | ((options: ShowSnackbarOptions | string) => void)
  | null = null;
let globalHideSnackbar: (() => void) | null = null;

/**
 * Imperative helper that can be called anywhere (e.g. in thunks, services, or utils)
 */
export const showSnackbar = (options: ShowSnackbarOptions | string) => {
  if (globalShowSnackbar) {
    globalShowSnackbar(options);
  } else {
    console.warn(
      '[Snackbar] showSnackbar was called before SnackbarProvider was mounted.',
    );
  }
};

/**
 * Imperative helper to hide the snackbar from anywhere
 */
export const hideSnackbar = () => {
  if (globalHideSnackbar) {
    globalHideSnackbar();
  }
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ShowSnackbarOptions>({
    message: '',
    type: 'default',
    iconMode: 'both',
    duration: 3000,
  });

  const handleShowSnackbar = useCallback(
    (options: ShowSnackbarOptions | string) => {
      if (typeof options === 'string') {
        setConfig({
          message: options,
          type: 'default',
          iconMode: 'both',
          duration: 3000,
        });
      } else {
        setConfig({
          type: 'default',
          iconMode: 'both',
          duration: 3000,
          ...options,
        });
      }
      setVisible(true);
    },
    [],
  );

  const handleHideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    globalShowSnackbar = handleShowSnackbar;
    globalHideSnackbar = handleHideSnackbar;
    return () => {
      globalShowSnackbar = null;
      globalHideSnackbar = null;
    };
  }, [handleShowSnackbar, handleHideSnackbar]);

  return (
    <SnackbarContext.Provider
      value={{ showSnackbar: handleShowSnackbar, hideSnackbar: handleHideSnackbar }}
    >
      {children}
      <CustomSnackbar
        visible={visible}
        onDismiss={handleHideSnackbar}
        message={config.message}
        type={config.type}
        iconMode={config.iconMode}
        duration={config.duration}
        bottomOffset={config.bottomOffset}
        action={config.action}
      />
    </SnackbarContext.Provider>
  );
};
 
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
