import { useResponsive } from '../utils/responsive';

interface LayoutOverrides {
  smallThreshold?: number; // Default: 700
  largeThreshold?: number; // Default: 850
}

export const useAuthLayout = (overrides?: LayoutOverrides) => {
  const { height, wp, hp, verticalScale, fontScale, moderateScale, width } =
    useResponsive();

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
      mediumGap: verticalScale(4),
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
      captionFontSize: isSmallHeight ? fontScale(11) : fontScale(12),
      titleFontSize: isSmallHeight ? fontScale(19) : fontScale(22),
      bodyFontSize: isSmallHeight ? fontScale(13) : fontScale(14),

      // Element Dimensions
      controlSize: isSmallHeight ? moderateScale(18) : moderateScale(22),
      iconSize: isSmallHeight ? moderateScale(18) : moderateScale(24),

      // Avatar Sizes
      avatarSizeSmall: isSmallHeight ? moderateScale(20) : moderateScale(24),
      avatarSize: isSmallHeight ? moderateScale(28) : moderateScale(32),
      avatarSizeLarge: isSmallHeight ? moderateScale(40) : moderateScale(48),
    },
  };
};
