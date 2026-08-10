/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { Linking, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/splash/splashScreen';
import { useNavigation } from '@react-navigation/native';
import './global.css';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { mmkv, store } from './src/store';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { useSelector } from 'react-redux';
import { RootState } from './src/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './src/types/navigationTypes';
import { navigate } from './src/navigation/navigationRef';
// import NetworkErrorScreen from './src/screens/networkErrorScreen';
// import { setNetworkError } from './src/store/commonSlice';
// import NetInfo from '@react-native-community/netinfo';

function App() {
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('Deep Link:', url);

      const token = new URL(url).searchParams.get('token');

      if (token) {
        await mmkv.set('accessToken', token);

        navigate('HomeTabs');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);
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

  // const isNetworkError = useSelector(
  //   (state: RootState) => state.common.isNetworkError,
  // );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // const handleRetry = async () => {
  //   const state = await NetInfo.fetch();

  //   if (state.isConnected) {
  //     store.dispatch(setNetworkError(false));
  //   }
  // };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* {isLoading ? (
        <SplashScreen />
      ) : isNetworkError ? (
        <NetworkErrorScreen onRetry={handleRetry} />
      ) : (
        <AppNavigator />
      )} */}
      {isLoading ? <SplashScreen /> : <AppNavigator />}
    </>
  );
}

export default App;
