import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';
import { STYLE_LABELS, type StyleSummary } from '@/types';

interface TasteSpectrumProps {
  summary: StyleSummary;
  /** Masque les libellés (usage compact en header). */
  compact?: boolean;
}

/** Nuances de vert attribuées aux styles dominants, du plus fort au plus doux. */
const SEGMENT_COLORS = ['#1D4A3F', '#37695A', '#5E8878', '#8FAEA2'];

/**
 * Le spectre de goût — visualisation signature de Swivy.
 * Une barre segmentée : les styles dominants en nuances de cyprès,
 * l'audace en segment cuivre. Réutilisée du résultat d'onboarding au Profil.
 */
export function TasteSpectrum({ summary, compact = false }: TasteSpectrumProps) {
  const hasSignal = summary.dominantStyles.length > 0;
  // Le cuivre occupe une part proportionnelle à l'audace (max 18 %).
  const copperShare = 0.06 + summary.boldness * 0.12;
  const styleShare = 1 - copperShare;

  return (
    <View accessibilityLabel="Spectre de goût">
      <View style={styles.track}>
        {hasSignal ? (
          summary.dominantStyles.map((entry, index) => (
            <View
              key={entry.style}
              style={{
                flex: Math.max(0.05, entry.share) * styleShare,
                backgroundColor: SEGMENT_COLORS[index] ?? SEGMENT_COLORS[3],
              }}
            />
          ))
        ) : (
          <View style={styles.empty} />
        )}
        <View style={{ flex: copperShare, backgroundColor: colors.copper }} />
      </View>
      {!compact && hasSignal ? (
        <View style={styles.legend}>
          {summary.dominantStyles.slice(0, 3).map((entry, index) => (
            <View key={entry.style} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS[index] ?? SEGMENT_COLORS[3] }]}
              />
              <AppText variant="micro" numberOfLines={1}>
                {STYLE_LABELS[entry.style]} · {Math.round(entry.share * 100)} %
              </AppText>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.copper }]} />
            <AppText variant="micro">Audace</AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.xs,
    overflow: 'hidden',
    gap: 2,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xxs,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
});
