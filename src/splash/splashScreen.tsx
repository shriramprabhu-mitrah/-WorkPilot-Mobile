import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import JiraLogo from '../assets/svg/splasScreenlogo';
import AnimatedRing from '../components/AnimatedRing';
import LoadingDots from '../components/LoadingDots';
import AppText from '../components/common/AppText';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../theme/ThemeProvider';

const SplashScreen = () => {
  const { moderateScale, hp } = useResponsive();
  const { colors, strings } = useTheme();

  const opacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const logoTranslateY = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) })
    );
    logoScale.value = withDelay(
      300,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) })
    );
    logoTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.exp) })
    );
    opacity.value = withDelay(2200, withTiming(0, { duration: 500 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoTranslateY.value }],
  }));

  const logoSize = moderateScale(48);
  const ringPad = moderateScale(12);

  // Dynamic opacity overlays calculated using theme colors
  const ring5Percent = `${colors.white}0D`;  // ~5% opacity of white (#FFFFFF)
  const ring10Percent = `${colors.white}1A`; // ~10% opacity of white (#FFFFFF)

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        containerStyle,
      ]}>
      {/* Dynamic Animated Rings */}
      <AnimatedRing
        size={moderateScale(500)}
        delay={0}
        borderColor={ring5Percent}
      />
      <AnimatedRing
        size={moderateScale(340)}
        delay={250}
        borderColor={ring10Percent}
      />
      <AnimatedRing
        size={moderateScale(190)}
        delay={450}
        borderWidth={0}
        backgroundColor={ring5Percent}
      />

      <Animated.View style={[{ alignItems: 'center' }, logoStyle]}>
        <View
          style={{
            padding: ringPad,
            borderRadius: moderateScale(24),
            backgroundColor: colors.white,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.black,
            shadowOpacity: 0.25,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 15,
          }}>
          <JiraLogo width={logoSize} height={logoSize} />
        </View>

        <AppText
          variant="h1"
          color={colors.white}
          style={{ marginTop: hp(2), letterSpacing: -0.8 }}>
          {strings.splash.title}
        </AppText>
      </Animated.View>

      <View style={{ position: 'absolute', bottom: hp(8) }}>
        <LoadingDots />
      </View>
    </Animated.View>
  );
};

export default SplashScreen;