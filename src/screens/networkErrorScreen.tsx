import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

import AppText from '../components/common/AppText';
import { PrimaryButton } from '../components';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../hooks/useTheme';

interface NetworkErrorScreenProps {
  onRetry: () => void;
}

const NetworkErrorScreen = ({ onRetry }: NetworkErrorScreenProps) => {
  const { moderateScale, verticalScale, fontScale } = useResponsive();
  const { colors } = useTheme();

  const styles = createStyles({
    moderateScale,
    verticalScale,
    fontScale,
    colors,
  });

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/Network Error.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      <AppText style={styles.title}>No Internet Connection</AppText>

      <AppText style={styles.subtitle}>
        Please check your internet connection and try again.
      </AppText>

      <PrimaryButton title='Retry' onPress={onRetry} style={styles.button} />
    </View>
  );
};

export default NetworkErrorScreen;

const createStyles = ({
  moderateScale,
  verticalScale,
  fontScale,
  colors,
}: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(24),
      backgroundColor: colors.placeholder,
    },
    animation: {
      width: moderateScale(220),
      height: moderateScale(220),
      marginBottom: verticalScale(24),
    },
    title: {
      fontSize: fontScale(22),
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: verticalScale(12),
      color: colors.text,
    },
    subtitle: {
      fontSize: fontScale(15),
      textAlign: 'center',
      lineHeight: fontScale(22),
      marginBottom: verticalScale(28),
      paddingHorizontal: moderateScale(10),
      color: colors.textSecondary, // or colors.placeholder / colors.grey based on your theme
    },
    button: {
      width: moderateScale(100),
    },
  });
