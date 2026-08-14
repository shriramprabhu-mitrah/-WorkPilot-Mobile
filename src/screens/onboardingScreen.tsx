import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import Svg, { Path } from 'react-native-svg';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { ONBOARDING_DATA } from '../utils/utils';
import { mmkv } from '../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LogoProps {
  width?: number;
  height?: number;
}

const JiraLogo = ({ width = 32, height = 32 }: LogoProps) => {
  return (
    <Svg width={width} height={height} viewBox='0 0 24 24' fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.5 11C2.5 6 7 2.5 12 2.5C17 2.5 21.5 6 21.5 11H2.5ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9Z'
        fill='white'
      />
      <Path
        d='M1.5 14C1.5 14 6 19.5 12 19.5C18 19.5 22.5 14 22.5 14'
        stroke='white'
        strokeWidth={2.5}
        strokeLinecap='round'
      />
    </Svg>
  );
};

const OnboardingScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const { isSmallHeight, layout } = useAuthLayout();
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === ONBOARDING_DATA.length - 1;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / SCREEN_WIDTH);

    if (index >= 0 && index < ONBOARDING_DATA.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
      return;
    }

    const nextIndex = activeIndex + 1;

    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const completeOnboarding = () => {
    mmkv.set('onboardingCompleted', true);
    navigation.replace('login');
  };

  // --- Centered Header ---
  const OnboardingHeader = () => (
    <View
      className='w-full items-center justify-center pb-2'
      style={{ paddingTop: moderateScale(60) }}
    >
      <View className='flex-row items-center gap-2.5'>
        <JiraLogo width={36} height={36} />
        <AppText
          variant='h1'
          color='white'
          style={{ fontSize: moderateScale(26) }}
          className='font-bold tracking-tight'
        >
          WorkPilot
        </AppText>
      </View>
    </View>
  );

  const renderSlideItem = ({
    item,
    index,
  }: {
    item: (typeof ONBOARDING_DATA)[0];
    index: number;
  }) => {
    const isFocused = activeIndex === index;

    return (
      <View
        style={{ width: SCREEN_WIDTH }}
        className='flex-1 items-center justify-center px-8'
      >
        {/* Central Graphic Visual (Key ensures auto-play triggers correctly on reverse swipe) */}
        <LottieView
          key={`${item.id}-${isFocused}`}
          source={item.animationSource}
          autoPlay
          loop
          style={{
            height: SCREEN_WIDTH * 0.65,
            width: SCREEN_WIDTH * 0.65,
            marginBottom: moderateScale(16),
          }}
        />

        {/* Slide Title & Subtitle */}
        <View className='items-center px-2'>
          <AppText
            variant='h2'
            color={colors?.white || '#FFFFFF'}
            style={{
              fontSize: isSmallHeight ? moderateScale(16) : moderateScale(19),
            }}
            className='text-center font-normal leading-6 opacity-95'
          >
            {item.title}
          </AppText>

          {item.subtitle ? (
            <AppText
              variant='body'
              color='rgba(255, 255, 255, 0.75)'
              style={{
                fontSize: isSmallHeight ? moderateScale(12) : moderateScale(13),
              }}
              className='mt-2 text-center leading-5'
            >
              {item.subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Screen scroll={false}>
      <View
        className='flex-1 justify-between'
        style={{
          backgroundColor: colors.primary,
          paddingBottom: isSmallHeight ? moderateScale(40) : moderateScale(30),
        }}
      >
        {/* Centered Top Header */}
        <OnboardingHeader />

        {/* Horizontal Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={renderSlideItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          keyExtractor={item => item.id}
          extraData={activeIndex}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          removeClippedSubviews={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          className='flex-1'
          style={{ flex: 1 }}
        />

        {/* Center Dots Indicator */}
        <View className='my-4 flex-row items-center justify-center gap-2'>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index.toString()}
              style={{
                backgroundColor:
                  activeIndex === index
                    ? '#FFFFFF'
                    : 'rgba(255, 255, 255, 0.4)',
                width: moderateScale(7),
                height: moderateScale(7),
              }}
              className='rounded-full'
            />
          ))}
        </View>

        {/* Bottom Actions */}
        <View className='w-full px-6 pb-10 pt-2'>
          {isLastSlide ? (
            <View className='w-full items-center justify-center'>
              <PrimaryButton
                title='GET STARTED'
                onPress={completeOnboarding}
                className='bg-white font-bold'
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: moderateScale(32),
                  paddingVertical: moderateScale(12),
                  alignSelf: 'center',
                }}
                textColor='black'
              />
            </View>
          ) : (
            <View
              className='w-full flex-row items-center justify-between'
              style={{ paddingHorizontal: layout.paddingHorizontal }}
            >
              <PrimaryButton
                title='SKIP'
                onPress={completeOnboarding}
                className='bg-white font-bold'
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: moderateScale(24),
                  paddingVertical: moderateScale(10),
                }}
                textColor='black'
              />
              <PrimaryButton
                title='NEXT'
                onPress={handleNext}
                className='bg-white font-bold'
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: moderateScale(24),
                  paddingVertical: moderateScale(10),
                }}
                textColor='black'
              />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
};

export default OnboardingScreen;
