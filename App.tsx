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
import { ThemeProvider } from './src/theme/ThemeProvider';
import { store } from './src/store';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // <KeyboardProvider>
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar
              translucent
              backgroundColor='transparent'
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <AppContent />
          </PaperProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  // const { loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return <AppNavigator />;
}

export default App;
