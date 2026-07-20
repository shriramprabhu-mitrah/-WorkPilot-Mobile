// import { Dimensions } from "react-native";

// const { height } = Dimensions.get("window");

// export const isSmallDevice = height < 700;

// export const Font = {
//     title: isSmallDevice ? 18 : 20,
//     heading: isSmallDevice ? 13 : 15,
//     subHeading: isSmallDevice ? 14 : 16,
//     label: isSmallDevice ? 14 : 15,
//     input: isSmallDevice ? 14 : 15,
//     button: isSmallDevice ? 15 : 16,
//     footer: isSmallDevice ? 13 : 14,
// };

// import { Dimensions } from "react-native";

// const { width, height } = Dimensions.get("window");

// export const SCREEN_WIDTH = width;
// export const SCREEN_HEIGHT = height;
// console.log("width", width, "height", height)
// export const isSmall = width < 360;
// export const isMedium = width >= 360 && width < 390;
// export const isLarge = width >= 390 && width < 430;
// export const isXLarge = width >= 430;

// export function responsiveClass(
//   small: string,
//   medium: string,
//   large: string,
//   xlarge?: string
// ) {
//   if (isSmall) return small;
//   if (isMedium) return medium;
//   if (isLarge) return large;

//   return xlarge ?? large;
// }


// import { Dimensions, PixelRatio } from 'react-native';

// const { width, height } = Dimensions.get('window');

// const guidelineBaseWidth = 390;
// const guidelineBaseHeight = 844;

// export const SCREEN_WIDTH = width;
// export const SCREEN_HEIGHT = height;

// export const scale = (size: number) =>
//   (width / guidelineBaseWidth) * size;

// export const verticalScale = (size: number) =>
//   (height / guidelineBaseHeight) * size;

// export const moderateScale = (
//   size: number,
//   factor = 0.5,
// ) => size + (scale(size) - size) * factor;

// export const fontScale = (size: number) =>
//   PixelRatio.roundToNearestPixel(moderateScale(size));

// export const wp = (percentage: number) =>
//   (SCREEN_WIDTH * percentage) / 100;

// export const hp = (percentage: number) =>
//   (SCREEN_HEIGHT * percentage) / 100;


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