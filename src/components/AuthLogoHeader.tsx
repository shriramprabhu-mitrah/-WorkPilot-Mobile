import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, useWindowDimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import JiraLogo from '../assets/svg/splasScreenlogo';
import RocketFlightSvg from '../assets/svg/RocketFlightSvg';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const AuthLogoHeader = () => {
  const { colors, strings } = useTheme();
  const { moderateScale, fontScale } = useResponsive();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  // Dynamic calculations based on viewport height
  const isCompact = screenHeight < 720;
  const headerHeight = Math.max(screenHeight * 0.26, 180);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(rocketAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, rocketAnim]);

  const rocketTranslateY = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const rocketTranslateX = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        height: headerHeight,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 1. Rich Sky/Blue Linear Gradient Base */}
      <Svg
        height='100%'
        width='100%'
        style={{ position: 'absolute', inset: 0 }}
      >
        <Defs>
          <SvgLinearGradient
            id='heroBlueGrad'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <Stop offset='0%' stopColor='#0A58CA' stopOpacity='1' />
            <Stop offset='45%' stopColor='#0D6EFD' stopOpacity='1' />
            <Stop offset='100%' stopColor='#38BDF8' stopOpacity='0.95' />
          </SvgLinearGradient>
        </Defs>
        <Path d='M0,0 L1000,0 L1000,1000 L0,1000 Z' fill='url(#heroBlueGrad)' />
      </Svg>

      {/* 2. Office Desk Background (Laptop, Coffee, Plant) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: -screenWidth * 0.05,
          width: '72%',
          opacity: 0.42,
        }}
      >
        <Image
          source={require('../assets/images/office.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        />
      </View>

      {/* 3. Rocket / Airplane SVG with Dashed Flight Path */}
      <Animated.View
        style={{
          position: 'absolute',
          top: isCompact ? 10 : 22,
          right: screenWidth * 0.08,
          zIndex: 8,
          opacity: rocketAnim,
          transform: [
            { translateX: rocketTranslateX },
            { translateY: rocketTranslateY },
          ],
        }}
      >
        <RocketFlightSvg
          width={moderateScale(150)}
          height={moderateScale(85)}
        />
      </Animated.View>

      {/* 4. Left Hero Branding Content */}
      <Animated.View
        style={{
          position: 'absolute',
          left: moderateScale(22),
          top: isCompact ? moderateScale(16) : moderateScale(26),
          zIndex: 10,
          maxWidth: '65%',
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* WorkPilot App Icon Box */}
        <View
          style={{
            width: moderateScale(46),
            height: moderateScale(46),
            borderRadius: moderateScale(13),
            backgroundColor: colors.primary,
            borderWidth: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: moderateScale(10),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.18,
            shadowRadius: 5,
            elevation: 4,
          }}
        >
          <JiraLogo width={moderateScale(26)} height={moderateScale(26)} />
        </View>

        {/* Title */}
        <AppText
          variant='h1'
          color={colors.white}
          style={{
            fontSize: fontScale(isCompact ? 22 : 26),
            fontWeight: '800',
            letterSpacing: 0.3,
            marginBottom: moderateScale(4),
          }}
        >
          {strings.splash?.title || 'WorkPilot'}
        </AppText>

        {/* Tagline */}
        <AppText
          variant='caption'
          color='rgba(255, 255, 255, 0.92)'
          style={{
            fontSize: fontScale(isCompact ? 11.5 : 12.5),
            lineHeight: isCompact ? moderateScale(16) : moderateScale(18),
            fontWeight: '500',
          }}
        >
          Stay focused. Stay productive.{'\n'}Anywhere.
        </AppText>
      </Animated.View>

      {/* 5. Bottom Elegant Organic Wave Transition into the White Card */}
      <Svg
        width='100%'
        height={moderateScale(42)}
        viewBox='0 0 375 42'
        preserveAspectRatio='none'
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          zIndex: 12,
        }}
      >
        <Path
          d='M0,18 C65,34 140,32 215,14 C270,0 325,4 375,16 L375,42 L0,42 Z'
          fill='#FFFFFF'
        />
      </Svg>
    </View>
  );
};

export default AuthLogoHeader;
