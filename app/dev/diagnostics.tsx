import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, IconButton, StyleTag } from '@/components';
import {
  boldnessLabel,
  compatibilityPercent,
  explainRecommendation,
  rawAffinity,
  topEntries,
} from '@/features/recommendations';
import { affinityBreakdown, contextBonus } from '@/features/recommendations/scoring';
import { useCatalog } from '@/hooks/useProducts';
import { useDebugStore } from '@/stores/debugStore';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, screenPadding, spacing } from '@/theme';

/**
 * Écran développeur — hors navigation normale.
 * Accès : appui long sur l'avatar dans Profil.
 * Explique pourquoi chaque produit est recommandé.
 */
export default function DiagnosticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: catalog } = useCatalog();

  const profile = useTasteStore((state) => state.profile);
  const selections = useTasteStore((state) => state.selections);
  const swipes = useTasteStore((state) => state.swipes);
  const hiddenProductIds = useTasteStore((state) => state.hiddenProductIds);
  const deck = useDebugStore((state) => state.deck);

  const topProduct = deck[0];
  const breakdown = useMemo(
    () => (topProduct ? affinityBreakdown(profile, topProduct) : []),
    [profile, topProduct],
  );

  const availableCount = catalog
    ? catalog.length - new Set([...swipes.map((s) => s.productId), ...hiddenProductIds]).size
    : 0;

  const lastSwipes = [...swipes].slice(-8).reverse();

  const weightSections: { title: string; map: Record<string, number> }[] = [
    { title: 'Styles', map: profile.styles },
    { title: 'Couleurs', map: profile.colors },
    { title: 'Matières', map: profile.materials },
    { title: 'Catégories', map: profile.categories },
    { title: 'Marques', map: profile.brands },
    { title: 'Budget', map: profile.priceBands },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="heading">Diagnostic</AppText>
          <AppText variant="caption">
            {profile.signalCount} signaux · audace {profile.boldness.toFixed(2)} (
            {boldnessLabel(profile.boldness)}) · {availableCount} produits encore disponibles ·
            deck : {deck.length} cartes
          </AppText>
        </View>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Fermer" size={40} iconSize={18} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Produit actuel */}
        {topProduct ? (
          <View style={styles.card}>
            <AppText variant="subheading">Carte du dessus : {topProduct.name}</AppText>
            <AppText variant="caption">
              affinité brute {rawAffinity(profile, topProduct).toFixed(3)} · bonus contexte{' '}
              {contextBonus(topProduct, selections).toFixed(3)} · affiché{' '}
              {compatibilityPercent(profile, topProduct)} %
            </AppText>
            <AppText variant="caption" style={styles.reason}>
              {explainRecommendation(profile, topProduct)}
            </AppText>
            {breakdown.map((entry) => (
              <View key={entry.dimension} style={styles.breakdownRow}>
                <AppText variant="micro" style={styles.breakdownLabel}>
                  {entry.dimension} (poids {entry.weight})
                </AppText>
                <AppText
                  variant="micro"
                  style={entry.contribution >= 0 ? styles.positive : styles.negative}
                >
                  {entry.contribution >= 0 ? '+' : ''}
                  {entry.contribution.toFixed(3)}
                </AppText>
                <AppText variant="micro" numberOfLines={1} style={styles.breakdownValues}>
                  {entry.values.join(', ')}
                </AppText>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <AppText variant="caption">
              Aucun deck actif — ouvre l’onglet Découvrir puis reviens ici.
            </AppText>
          </View>
        )}

        {/* Mélange exploration / exploitation */}
        <View style={styles.card}>
          <AppText variant="subheading">Exploration</AppText>
          <AppText variant="caption">
            Motif de tirage : 7 compatibles / 2 adjacents / 1 exploratoire par tranche de 10 cartes.
            Garde-fous : marque ≤ 2 sur 5 cartes, catégorie ≤ 2 d’affilée, style dominant ≤ 3 d’affilée.
          </AppText>
        </View>

        {/* Poids du profil */}
        {weightSections.map((section) => {
          const entries = Object.entries(section.map).sort((a, b) => b[1] - a[1]);
          if (entries.length === 0) return null;
          return (
            <View key={section.title} style={styles.card}>
              <AppText variant="subheading">{section.title}</AppText>
              <View style={styles.tags}>
                {entries.slice(0, 12).map(([key, weight]) => (
                  <StyleTag
                    key={key}
                    label={`${key} ${weight >= 0 ? '+' : ''}${weight.toFixed(1)}`}
                    tone={weight > 0 ? 'accent' : 'neutral'}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Derniers swipes */}
        <View style={styles.card}>
          <AppText variant="subheading">Derniers swipes</AppText>
          {lastSwipes.length === 0 ? (
            <AppText variant="caption">Aucun swipe pour le moment.</AppText>
          ) : (
            lastSwipes.map((swipe) => (
              <AppText key={`${swipe.productId}-${swipe.at}`} variant="micro" style={styles.swipeRow}>
                {swipe.action.toUpperCase()} · {swipe.productId} · {swipe.source} ·{' '}
                {new Date(swipe.at).toLocaleTimeString('fr-FR')}
              </AppText>
            ))
          )}
        </View>

        {/* Exclusions */}
        <View style={styles.card}>
          <AppText variant="subheading">Exclusions</AppText>
          <AppText variant="caption">
            {swipes.length} produits swipés · {hiddenProductIds.length} masqués manuellement —
            tous exclus du deck.
          </AppText>
          {topEntries(profile.styles, 1).length === 0 && profile.signalCount > 0 ? (
            <AppText variant="micro" style={styles.negative}>
              Attention : aucun style avec un poids positif malgré des signaux — profil très négatif.
            </AppText>
          ) : null}
        </View>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  reason: {
    color: colors.accentDeep,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownLabel: {
    width: 150,
    color: colors.textSecondary,
  },
  positive: {
    color: colors.like,
  },
  negative: {
    color: colors.dislike,
  },
  breakdownValues: {
    flex: 1,
    color: colors.textTertiary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  swipeRow: {
    color: colors.textSecondary,
  },
});
