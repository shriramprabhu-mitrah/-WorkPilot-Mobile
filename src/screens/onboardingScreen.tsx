import React, { useState } from 'react';
import {
  View,
  Image,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useSharedValue,
  Easing,
  clamp,
} from 'react-native-reanimated';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import JiraLogo from '../assets/svg/splasScreenlogo';
import CosmicOrbitalTracks from '../components/onboarding/CosmicOrbitalTracks';
import RotatingSlide from '../components/onboarding/RotatingSlide';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { ONBOARDING_DATA } from '../utils/utils';
import { mmkv } from '../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { isSmallHeight } = useAuthLayout();

  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = ONBOARDING_DATA.length;
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === totalSlides - 1;

  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);
  const buttonRotation = useSharedValue(0);
  const startButtonRotation = useSharedValue(0);

  const completeOnboarding = () => {
    mmkv.set('onboardingCompleted', true);
    navigation.replace('loginScreen');
  };

  const updateActiveIndex = (nextIdx: number) => {
    setActiveIndex(nextIdx);
  };

  const animateToSlide = (targetIndex: number) => {
    'worklet';
    const targetIdxClamped = clamp(targetIndex, 0, totalSlides - 1);
    const targetRotation = targetIdxClamped * 360;

    buttonRotation.value = withTiming(targetRotation, {
      duration: 450,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    progress.value = withTiming(
      targetIdxClamped,
      {
        duration: 450,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      },
      finished => {
        if (finished) {
          runOnJS(updateActiveIndex)(targetIdxClamped);
        }
      },
    );
  };

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
      return;
    }
    animateToSlide(activeIndex + 1);
  };

  const handlePrev = () => {
    if (isFirstSlide) return;
    animateToSlide(activeIndex - 1);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startProgress.value = progress.value;
      startButtonRotation.value = buttonRotation.value;
    })
    .onUpdate(event => {
      // Left-to-Right swipe (+translationX): moves forward to NEXT (+)
      // Right-to-Left swipe (-translationX): moves backward to PREV (-)
      const deltaProgress = event.translationX / (SCREEN_WIDTH * 0.85);
      const newProgress = startProgress.value + deltaProgress;

      progress.value = clamp(newProgress, 0, totalSlides - 1);
      buttonRotation.value = startButtonRotation.value + deltaProgress * 360;
    })
    .onEnd(event => {
      const delta = progress.value - startProgress.value;
      const velocity = event.velocityX;

      let targetSlide = startProgress.value;

      // Swiped Left -> Right: delta > 0 OR positive velocity -> NEXT
      if (delta > 0.22 || velocity > 450) {
        targetSlide = Math.min(
          Math.floor(startProgress.value) + 1,
          totalSlides - 1,
        );
        // Swiped Right -> Left: delta < 0 OR negative velocity -> PREV
      } else if (delta < -0.22 || velocity < -450) {
        targetSlide = Math.max(Math.ceil(startProgress.value) - 1, 0);
      } else {
        targetSlide = Math.round(startProgress.value);
      }

      animateToSlide(targetSlide);
    });

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value > 0.05 ? 1 : 0, { duration: 250 }),
    transform: [
      {
        scale: withTiming(progress.value > 0.05 ? 1 : 0.8, { duration: 250 }),
      },
    ],
  }));

  return (
    <Screen scroll={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          position: 'relative',
          overflow: 'hidden',
        }}
        className='justify-between'
      >
        {/* Layer 1: Office Background Image */}
        <View
          pointerEvents='none'
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

        {/* Layer 2: Curved Header Wave */}
        <Svg
          pointerEvents='none'
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
              <Stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.18' />
              <Stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.01' />
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

        {/* Layer 3: Entire-Screen Reduced-Opacity Orbital Rings */}
        <CosmicOrbitalTracks buttonRotation={buttonRotation} />

        {/* Layer 4: Header */}
        <View
          className='w-full items-center justify-center pb-2'
          style={{ paddingTop: moderateScale(60), zIndex: 10 }}
        >
          <View className='flex-row items-center gap-2.5'>
            <JiraLogo width={36} height={36} />
            <AppText
              variant='h1'
              color={colors.white}
              style={{ fontSize: moderateScale(26) }}
              className='font-bold tracking-tight'
            >
              {strings?.splash?.title || 'WorkPilot'}
            </AppText>
          </View>
        </View>

        {/* Layer 5: Stage with Swipe Gesture Support */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={{
              flex: 1,
              width: '100%',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {ONBOARDING_DATA.map((item, index) => (
              <RotatingSlide
                key={item.id}
                item={item}
                index={index}
                progress={progress}
                isSmallHeight={isSmallHeight}
                colors={colors}
              />
            ))}
          </Animated.View>
        </GestureDetector>

        {/* Layer 6: Bottom Navigation Bar */}
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: moderateScale(28),
            zIndex: 20,
            paddingBottom: isSmallHeight
              ? moderateScale(30)
              : moderateScale(36),
          }}
        >
          <Pressable onPress={completeOnboarding} hitSlop={15}>
            <AppText
              variant='body'
              color='rgba(255, 255, 255, 0.75)'
              style={{ fontSize: moderateScale(15), fontWeight: '600' }}
            >
              SKIP
            </AppText>
          </Pressable>

          {/* Action Buttons: Back + Next / GO Button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              zIndex: 20,
            }}
          >
            <Animated.View style={backButtonAnimatedStyle}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={isFirstSlide}
                activeOpacity={0.7}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  backgroundColor: 'rgba(0, 47, 255, 0.65)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#80DEEA',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.65,
                  shadowRadius: 16,
                  elevation: 12,
                  pointerEvents: isFirstSlide ? 'none' : undefined,
                }}
              >
                <Svg width={18} height={18} viewBox='0 0 24 24' fill='none'>
                  <Path
                    d='M19 12H5M5 12L12 19M5 12L12 5'
                    stroke='#FFFFFF'
                    strokeWidth={2.5}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </Svg>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
              <Animated.View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 12,
                  backgroundColor: isLastSlide
                    ? 'rgba(0, 70, 255, 0.9)'
                    : 'rgba(0, 47, 255, 0.65)',
                  shadowColor: isLastSlide ? '#00E5FF' : '#80DEEA',
                  shadowOpacity: isLastSlide ? 0.85 : 0.65,
                  shadowRadius: isLastSlide ? 20 : 16,
                }}
              >
                {isLastSlide ? (
                  <AppText
                    variant='body'
                    color='#FFFFFF'
                    style={{
                      fontWeight: '800',
                      fontSize: moderateScale(16),
                      letterSpacing: 1,
                    }}
                  >
                    GO
                  </AppText>
                ) : (
                  <Svg width={22} height={22} viewBox='0 0 24 24' fill='none'>
                    <Path
                      d='M5 12H19M19 12L12 5M19 12L12 19'
                      stroke='#FFFFFF'
                      strokeWidth={2.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </Svg>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default OnboardingScreen;
