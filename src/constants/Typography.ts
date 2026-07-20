import { fontScale } from '../utils/responsive';

interface TypographyStyle {
  fontSize: number;
  fontFamily: string;
  lineHeight?: number;
}

export const FontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const Typography: Record<string, TypographyStyle> = {
  h1: {
    fontSize: fontScale(32),
    fontFamily: FontFamily.bold,
  },

  h2: {
    fontSize: fontScale(28),
    fontFamily: FontFamily.bold,
  },

  h3: {
    fontSize: fontScale(24),
    fontFamily: FontFamily.semiBold,
  },

  h4: {
    fontSize: fontScale(20),
    fontFamily: FontFamily.semiBold,
  },

  title: {
    fontSize: fontScale(18),
    fontFamily: FontFamily.semiBold,
  },

  bodyLarge: {
    fontSize: fontScale(16),
    fontFamily: FontFamily.regular,
  },

  body: {
    fontSize: fontScale(14),
    fontFamily: FontFamily.regular,
  },

  caption: {
    fontSize: fontScale(12),
    fontFamily: FontFamily.regular,
  },

  button: {
    fontSize: fontScale(16),
    fontFamily: FontFamily.semiBold,
  },
};