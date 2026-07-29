import { useResponsive } from '../utils/responsive';

interface LayoutOverrides {
  smallThreshold?: number; // Default: 700
  largeThreshold?: number; // Default: 850
}

export const useAuthLayout = (overrides?: LayoutOverrides) => {
  const { height, wp, hp, verticalScale, fontScale, moderateScale } = useResponsive();

  const smallThreshold = overrides?.smallThreshold ?? 700;
  const largeThreshold = overrides?.largeThreshold ?? 850;

  // Device Height Tier Flags
  const isSmallHeight = height < smallThreshold;
  const isLargeHeight = height > largeThreshold;
  const isMediumHeight = !isSmallHeight && !isLargeHeight;

  return {
    // Device Height Flags
    isSmallHeight,
    isMediumHeight,
    isLargeHeight,

    // Helper Responsive Functions
    wp,
    hp,
    verticalScale,
    fontScale,
    moderateScale,

    // Universal Responsive Layout Values
    layout: {
      // Container Insets & Padding
      paddingHorizontal: wp(6),
      paddingTop: isSmallHeight
        ? verticalScale(10)
        : isLargeHeight
        ? verticalScale(24)
        : verticalScale(16),
      paddingBottom: isSmallHeight
        ? verticalScale(10)
        : isLargeHeight
        ? verticalScale(24)
        : verticalScale(16),

      // Standard Flexible Gaps
      tightGap: verticalScale(2),
      elementGap: isSmallHeight
        ? verticalScale(8)
        : isLargeHeight
        ? verticalScale(12)
        : verticalScale(10),
      sectionGap: isSmallHeight
        ? verticalScale(8)
        : isLargeHeight
        ? verticalScale(20)
        : verticalScale(14),
      largeSectionGap: isSmallHeight
        ? verticalScale(10)
        : isLargeHeight
        ? verticalScale(28)
        : verticalScale(16),

      // Typography
      titleFontSize: isSmallHeight ? fontScale(19) : fontScale(22),
      bodyFontSize: isSmallHeight ? fontScale(13) : fontScale(14),

      // Element Dimensions
      controlSize: isSmallHeight ? moderateScale(18) : moderateScale(22),
      iconSize: isSmallHeight ? moderateScale(18) : moderateScale(24),
    },
  };
};