import type { TextStyle } from 'react-native';
import { colors } from './colors';

export const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  /** Serif éditoriale — uniquement là où l'app « parle ». */
  serif: 'Fraunces_500Medium',
  serifStrong: 'Fraunces_600SemiBold',
} as const;

/**
 * Hiérarchie V2 — plus dense que la V1.
 * La serif est réservée aux variantes editorial*.
 */
export const typography = {
  /** Voix éditoriale forte : welcome, résultat de profil, hero Pour toi. */
  editorialTitle: {
    fontFamily: fontFamily.serifStrong,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  /** Voix éditoriale courante : révélations, nom produit en fiche. */
  editorial: {
    fontFamily: fontFamily.serif,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  display: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  subheading: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
