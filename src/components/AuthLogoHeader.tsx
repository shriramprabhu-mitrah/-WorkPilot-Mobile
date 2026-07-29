import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, useWindowDimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import JiraLogo from '../assets/svg/splasScreenlogo';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const AuthLogoHeader = () => {
  const { colors, strings } = useTheme();
  const { moderateScale, fontScale } = useResponsive();
  const { height: screenHeight } = useWindowDimensions();

  // Dynamic calculations based on viewport height
  const isCompact = screenHeight < 720;
  const headerHeight = Math.max(screenHeight * 0.28, 160);
  const logoSize = isCompact ? moderateScale(24) : moderateScale(32);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

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
      {/* 1. Office Background Image */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '75%',
          opacity: 0.3,
        }}
      >
        <Image
          source={require('../assets/images/office.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        />
      </View>

      {/* 2. SVG Flowing Gradient Wave Overlay */}
      <Svg
        height='100%'
        width='100%'
        style={{ position: 'absolute', inset: 0 }}
      >
        <Defs>
          <LinearGradient id='blueWave' x1='0%' y1='0%' x2='100%' y2='100%'>
            <Stop offset='0%' stopColor={colors.primary} stopOpacity='1' />
            <Stop offset='60%' stopColor={colors.primary} stopOpacity='0.9' />
            <Stop offset='100%' stopColor={colors.primary} stopOpacity='0.2' />
          </LinearGradient>
          <LinearGradient id='glassGlow' x1='0%' y1='0%' x2='100%' y2='0%'>
            <Stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.25' />
            <Stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.02' />
          </LinearGradient>
        </Defs>

        <Path
          d='M0,0 L180,0 C150,110 120,170 80,240 C50,280 0,300 0,300 Z'
          fill='url(#blueWave)'
        />
        <Path
          d='M0,0 L210,0 C180,130 140,190 95,260 C60,295 0,310 0,310 Z'
          fill='url(#glassGlow)'
        />
        <Circle cx='15%' cy='20%' r='90' fill='url(#glassGlow)' />
      </Svg>

      {/* 3. Hero Branding Content */}
      <Animated.View
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 16,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          gap: isCompact ? 2 : 3,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: isCompact ? 6 : 10,
          }}
        >
          <JiraLogo width={logoSize} height={logoSize} />
        </View>

        <AppText
          variant='h2'
          color={colors.white}
          style={{
            fontSize: fontScale(isCompact ? 18 : 22),
            fontWeight: '700',
          }}
        >
          {strings.splash?.title || 'WorkPilot'}
        </AppText>

        <AppText
          variant='body'
          color={colors.white}
          style={{ fontSize: fontScale(11), textAlign: 'center', opacity: 0.9 }}
        >
          Stay focused. Stay productive. Anywhere.
        </AppText>
      </Animated.View>
    </View>
  );
};

export default AuthLogoHeader;
