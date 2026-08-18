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
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../utils/responsive';
import { LOGIN_URL } from '../utils/utils';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WebLoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();
  const { moderateScale, fontScale } = useResponsive();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            height: moderateScale(56),
            paddingHorizontal: moderateScale(16),
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              minWidth: moderateScale(70),
              minHeight: moderateScale(44),
            },
          ]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.backText,
              {
                fontSize: fontScale(16),
                color: colors.primary,
              },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              fontSize: fontScale(18),
              color: colors.text,
            },
          ]}
        >
          WorkPilot Login
        </Text>

        {/* Right Spacer */}
        <View
          style={{
            width: moderateScale(70),
          }}
        />
      </View>

      {/* WebView Container */}
      <View style={styles.webViewContainer}>
        {/* Loading Indicator */}
        {loading && (
          <View
            style={[
              styles.loader,
              {
                backgroundColor: colors.background,
              },
            ]}
          >
            <ActivityIndicator size='large' color={colors.primary} />

            <Text
              style={[
                styles.loadingText,
                {
                  marginTop: moderateScale(10),
                  fontSize: fontScale(14),
                  color: colors.textSecondary,
                },
              ]}
            >
              Loading...
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          source={{ uri: LOGIN_URL }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          cacheEnabled={false}
          startInLoadingState={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          onLoadStart={({ nativeEvent }) => {
            console.log('[WEBVIEW] LOAD START:', nativeEvent.url);
            setLoading(true);
          }}
          onLoadEnd={({ nativeEvent }) => {
            console.log('[WEBVIEW] LOAD END:', nativeEvent.url);
            setLoading(false);
          }}
          onError={({ nativeEvent }) => {
            console.log('[WEBVIEW] ERROR:', {
              url: nativeEvent.url,
              description: nativeEvent.description,
            });

            setLoading(false);
          }}
          onHttpError={({ nativeEvent }) => {
            console.log('[WEBVIEW] HTTP ERROR:', {
              url: nativeEvent.url,
              statusCode: nativeEvent.statusCode,
            });
          }}
          onShouldStartLoadWithRequest={request => {
            const url = request.url;

            console.log('[WEBVIEW] NAVIGATION:', url);

            if (url.startsWith('workpilot://auth')) {
              console.log('[WEBVIEW] AUTH CALLBACK DETECTED');

              Linking.openURL(url);

              return false;
            }

            return true;
          }}
          onNavigationStateChange={navState => {
            console.log('[WEBVIEW] STATE:', {
              url: navState.url,
              loading: navState.loading,
              canGoBack: navState.canGoBack,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default WebLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },

  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backText: {
    fontWeight: '600',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },

  webViewContainer: {
    flex: 1,
    position: 'relative',
  },

  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  loadingText: {
    fontWeight: '400',
  },
});
