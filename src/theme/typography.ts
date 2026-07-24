import type { TextStyle } from 'react-native';
import { colors } from './colors';

export const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

/**
 * Hiérarchie typographique.
 * Les titres sont forts mais jamais massifs ; interlignage aéré.
 */
export const typography = {
  display: {
    fontFamily: fontFamily.extrabold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subheading: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  micro: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
