import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, FilterChip } from '@/components';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, screenPadding, spacing } from '@/theme';
import {
  CATEGORY_LABELS,
  PRICE_BAND_LABELS,
  categorySlugSchema,
  priceBandSchema,
  type CategorySlug,
  type PriceBand,
} from '@/types';

/**
 * Filtres du feed de découverte : catégories mises en avant et budget.
 * Ils orientent le moteur de recommandation sans exclure brutalement.
 */
export default function FiltersModal() {
  const router = useRouter();
  const categories = useTasteStore((state) => state.selections.categories);
  const priceBand = useTasteStore((state) => state.selections.priceBand);
  const setSelections = useTasteStore((state) => state.setSelections);
  const seedProfileFromSelections = useTasteStore((state) => state.seedProfileFromSelections);

  const toggleCategory = (slug: CategorySlug) => {
    setSelections({
      categories: categories.includes(slug)
        ? categories.filter((category) => category !== slug)
        : [...categories, slug],
    });
  };

  const togglePriceBand = (band: PriceBand) => {
    setSelections({ priceBand: priceBand === band ? null : band });
  };

  return (
    <View style={styles.root}>
      <View style={styles.handle} />
      <AppText variant="heading">Filtres</AppText>
      <AppText variant="caption" style={styles.hint}>
        Ces préférences guident ton feed — elles n’enferment jamais complètement la découverte.
      </AppText>

      <View style={styles.section}>
        <AppText variant="subheading">Catégories mises en avant</AppText>
        <View style={styles.chips}>
          {categorySlugSchema.options.map((slug) => (
            <FilterChip
              key={slug}
              label={CATEGORY_LABELS[slug]}
              selected={categories.includes(slug)}
              onPress={() => toggleCategory(slug)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading">Budget</AppText>
        <View style={styles.chips}>
          {priceBandSchema.options.map((band) => (
            <FilterChip
              key={band}
              label={PRICE_BAND_LABELS[band]}
              selected={priceBand === band}
              onPress={() => togglePriceBand(band)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Appliquer"
          onPress={() => {
            seedProfileFromSelections();
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
  },
  hint: {},
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});
