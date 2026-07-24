import type { ViewStyle } from 'react-native';

/** Ombres douces — jamais lourdes. */
export const shadows = {
  subtle: {
    shadowColor: '#151515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#151515',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  floating: {
    shadowColor: '#151515',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
} satisfies Record<string, ViewStyle>;
