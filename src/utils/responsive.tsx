import { useWindowDimensions, PixelRatio, Dimensions } from 'react-native';

const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

// Static versions (for use outside components, e.g. constants files)
const { width: STATIC_WIDTH } = Dimensions.get('window');
const staticScale = (size: number) => (STATIC_WIDTH / guidelineBaseWidth) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (staticScale(size) - size) * factor;
export const fontScale = (size: number) =>
  PixelRatio.roundToNearestPixel(moderateScale(size));

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const scale = (size: number) => {
    return (width / guidelineBaseWidth) * size;
  };
  const verticalScale = (size: number) => {
    return (height / guidelineBaseHeight) * size;
  };
  const moderateScale = (
    size: number,
    factor = 0.5
  ) => {
    return size + (scale(size) - size) * factor;
  };
  const fontScale = (size: number) => {
    return PixelRatio.roundToNearestPixel(
      moderateScale(size)
    );
  };
  const wp = (percentage:number)=>{
    return (width * percentage) / 100;
  };
  const hp = (percentage:number)=>{
    return (height * percentage) / 100;
  };

  return {
    width,
    height,
    scale,
    verticalScale,
    moderateScale,
    fontScale,
    wp,
    hp
  };
};