import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText, PreferenceBar, StyleTag } from '@/components';
import { boldnessLabel } from '@/features/recommendations';
import { colors, radius, shadows, spacing } from '@/theme';
import { STYLE_LABELS, type Product, type StyleSummary } from '@/types';

interface StyleDnaCardProps {
  summary: StyleSummary;
  /** Coups de cœur récents pour le mini moodboard. */
  moodboardProducts?: Product[];
  compact?: boolean;
}

/**
 * Carte "ADN esthétique" : styles dominants, matières, couleurs,
 * audace et budget moyen — le portrait déco de l'utilisateur.
 */
export function StyleDnaCard({ summary, moodboardProducts = [], compact = false }: StyleDnaCardProps) {
  const hasSignal = summary.dominantStyles.length > 0;

  return (
    <View style={styles.card}>
      {hasSignal ? (
        <View style={styles.bars}>
          {summary.dominantStyles.slice(0, compact ? 2 : 4).map((entry) => (
            <PreferenceBar key={entry.style} label={STYLE_LABELS[entry.style]} share={entry.share} />
          ))}
        </View>
      ) : (
        <AppText variant="bodySmall">
          Swipe quelques produits pour révéler ton ADN esthétique.
        </AppText>
      )}

      {summary.topMaterials.length > 0 || summary.topColors.length > 0 ? (
        <View style={styles.tags}>
          {summary.topMaterials.slice(0, compact ? 2 : 4).map((material) => (
            <StyleTag key={material} label={material} />
          ))}
          {summary.topColors.slice(0, compact ? 2 : 4).map((color) => (
            <StyleTag key={color} label={`tons ${color}`} tone="accent" />
          ))}
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <AppText variant="micro" style={styles.metaLabel}>
            Audace
          </AppText>
          <AppText variant="caption" style={styles.metaValue}>
            {boldnessLabel(summary.boldness)}
          </AppText>
        </View>
        {summary.averageBudget !== null ? (
          <View style={styles.metaItem}>
            <AppText variant="micro" style={styles.metaLabel}>
              Budget moyen aimé
            </AppText>
            <AppText variant="caption" style={styles.metaValue}>
              {summary.averageBudget.toLocaleString('fr-FR')} €
            </AppText>
          </View>
        ) : null}
      </View>

      {!compact && moodboardProducts.length >= 3 ? (
        <View style={styles.moodboard}>
          {moodboardProducts.slice(0, 4).map((product) => (
            <Image
              key={product.id}
              source={{ uri: product.images[0] }}
              style={styles.moodboardImage}
              contentFit="cover"
              transition={160}
              cachePolicy="memory-disk"
              accessibilityLabel={product.name}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.subtle,
  },
  bars: {
    gap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    color: colors.textTertiary,
  },
  metaValue: {
    color: colors.textPrimary,
  },
  moodboard: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  moodboardImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
});
