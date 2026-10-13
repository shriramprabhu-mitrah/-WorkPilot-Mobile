import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import AppText from '../common/AppText';
import { ONBOARDING_DATA } from '../../utils/utils';
import { moderateScale } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RotatingSlideProps {
  item: (typeof ONBOARDING_DATA)[0];
  index: number;
  progress: SharedValue<number>;
  isSmallHeight: boolean;
  colors: any;
}

const RotatingSlide = ({
  item,
  index,
  progress,
  isSmallHeight,
  colors,
}: RotatingSlideProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const diff = index - progress.value;

    const rotateZ = interpolate(
      diff,
      [-1, 0, 1],
      [90, 0, -90],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      diff,
      [-0.8, 0, 0.8],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      diff,
      [-1, 0, 1],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP,
    );

    const isVisible = Math.abs(diff) <= 1.1;

    return {
      opacity: isVisible ? opacity : 0,
      transform: [
        { translateX: SCREEN_WIDTH * 0.45 },
        { translateY: SCREEN_HEIGHT * 0.4 },
        { rotate: `${rotateZ}deg` },
        { translateX: -SCREEN_WIDTH * 0.45 },
        { translateY: -SCREEN_HEIGHT * 0.4 },
        { scale },
      ],
      display: isVisible ? 'flex' : 'none',
    };
  });

  return (
    <Animated.View style={[styles.slideContainer, animatedStyle]}>
      <View style={styles.cardContent}>
        <View style={styles.animationWrapper}>
          <LottieView
            source={item.animationSource}
            autoPlay
            loop
            style={{
              height: SCREEN_WIDTH * 0.65,
              width: SCREEN_WIDTH * 0.65,
              marginBottom: moderateScale(16),
            }}
          />
        </View>

        <View className='items-center px-6'>
          <AppText
            variant='h2'
            color={colors?.white || '#FFFFFF'}
            style={{
              fontSize: isSmallHeight ? moderateScale(18) : moderateScale(22),
            }}
            className='text-center font-bold leading-7'
          >
            {item.title}
          </AppText>

          {item.subtitle ? (
            <AppText
              variant='body'
              color='rgba(255, 255, 255, 0.85)'
              style={{
                fontSize: isSmallHeight ? moderateScale(13) : moderateScale(14),
              }}
              className='mt-3 text-center leading-5'
            >
              {item.subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    width: SCREEN_WIDTH * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RotatingSlide;
