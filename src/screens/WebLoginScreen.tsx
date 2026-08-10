import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const LOGIN_URL =
  'https://workpilot-frontend-4vak.onrender.com/signin?source=mobile';

const WebLoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>WorkPilot Login</Text>

        <View style={{ width: 50 }} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size='large' color='#1976D2' />
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: LOGIN_URL }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        startInLoadingState={false}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={request => {
          const url = request.url;

          console.log('WebView URL:', url);

          if (url.startsWith('workpilot://auth')) {
            Linking.openURL(url);
            return false;
          }

          return true;
        }}
        onNavigationStateChange={navState => {
          console.log('Current URL:', navState.url);
        }}
      />
    </SafeAreaView>
  );
};

export default WebLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    width: 50,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
});
