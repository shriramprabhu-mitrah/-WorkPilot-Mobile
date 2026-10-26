import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, useWindowDimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import AnimatedRN, {
  Easing,
  FadeInUp,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import JiraLogo from '../assets/svg/splasScreenlogo';
import CosmicOrbitalTracks from '../components/onboarding/CosmicOrbitalTracks';
import { Radius } from '../constants/Radius';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useResponsive } from '../utils/responsive';

const OnBoardingLoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { isSmallHeight, layout } = useAuthLayout();
  const { moderateScale } = useResponsive();
  const { height: screenHeight } = useWindowDimensions();
  const isCompact = screenHeight < 720;
  const logoSize = isCompact ? moderateScale(28) : moderateScale(36);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonRotation = useSharedValue(0);

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

  const handleLoginPress = () => {
    navigation.navigate('loginScreen');
  };

  return (
    <Screen scroll={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          position: 'relative',
        }}
        className='justify-between'
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '85%',
            opacity: 0.18,
          }}
        >
          <Image
            source={require('../assets/images/office.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode='cover'
          />
        </View>
        <Svg
          height='100%'
          width='100%'
          style={{ position: 'absolute', inset: 0 }}
        >
          <Defs>
            <LinearGradient id='blueWave' x1='0%' y1='0%' x2='100%' y2='100%'>
              <Stop offset='0%' stopColor={colors.primary} stopOpacity='1' />
              <Stop offset='60%' stopColor={colors.primary} stopOpacity='0.9' />
              <Stop
                offset='100%'
                stopColor={colors.primary}
                stopOpacity='0.3'
              />
            </LinearGradient>
            <LinearGradient id='glassGlow' x1='0%' y1='0%' x2='100%' y2='0%'>
              <Stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.25' />
              <Stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.02' />
            </LinearGradient>
          </Defs>
          <Path
            d='M0,0 L240,0 C190,200 150,320 100,450 C60,550 0,650 0,650 Z'
            fill='url(#blueWave)'
          />
          <Path
            d='M0,0 L280,0 C220,230 170,360 115,480 C70,580 0,680 0,680 Z'
            fill='url(#glassGlow)'
          />
          <Circle cx='20%' cy='30%' r='140' fill='url(#glassGlow)' />
        </Svg>
        <CosmicOrbitalTracks buttonRotation={buttonRotation} />
        <View
          className='flex-1 items-center justify-center'
          style={{ gap: layout.largeSectionGap * 4 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <JiraLogo width={logoSize * 4} height={logoSize * 4} />
            <AppText
              variant='h2'
              color={colors.white}
              className='text-center font-bold'
            >
              {strings.splash?.title}
            </AppText>
            <AppText
              variant='bodyLarge'
              color={colors.white}
              style={{ textAlign: 'center' }}
            >
              Stay focused. Stay productive. Anywhere.
            </AppText>
          </Animated.View>
          <AnimatedRN.View
            entering={FadeInUp.delay(300).duration(700).springify()}
            style={{
              paddingBottom: isSmallHeight
                ? moderateScale(24)
                : moderateScale(36),
              gap: layout.sectionGap,
              alignItems: 'center',
              zIndex: 20,
            }}
            className='w-full items-center justify-center'
          >
            <PrimaryButton
              title='LOGIN'
              onPress={() => {
                buttonRotation.value = withTiming(buttonRotation.value + 360, {
                  duration: 450,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
                handleLoginPress();
              }}
              className='w-1/2 font-bold'
              style={{
                backgroundColor: colors.white,
                paddingVertical: moderateScale(10),
                borderRadius: Radius.sm,
              }}
              textColor={colors.primary}
            />
            <View
              style={{
                alignItems: 'center',
                paddingHorizontal: moderateScale(16),
              }}
            >
              <AppText
                variant='body'
                color='rgba(255, 255, 255, 0.85)'
                style={{ fontSize: moderateScale(isSmallHeight ? 12 : 14) }}
              >
                Welcome back! Log in to access your account.
              </AppText>
            </View>
          </AnimatedRN.View>
        </View>
      </View>
    </Screen>
  );
};

export default OnBoardingLoginScreen;
