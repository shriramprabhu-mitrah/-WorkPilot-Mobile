/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/splash/splashScreen';
import './global.css';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { store } from './src/store';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';

function App() {
  // const isDarkMode = useColorScheme() === 'dark';

  return (
    // <KeyboardProvider>
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <PaperProvider>
            {/* <StatusBar
              translucent
              backgroundColor='transparent'
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            /> */}
            <AppContent />
          </PaperProvider>
        </SafeAreaProvider>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </Provider>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {isLoading ? <SplashScreen /> : <AppNavigator />}
    </>
  );
}

export default App;
