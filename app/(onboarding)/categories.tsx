import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SelectableTile } from '@/features/onboarding/SelectableTile';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { imagePool, unsplash } from '@/mocks/images';
import { useTasteStore } from '@/stores/tasteStore';
import { spacing } from '@/theme';
import { CATEGORY_LABELS, categorySlugSchema, type CategorySlug } from '@/types';

const categoryOptions = categorySlugSchema.options.map((slug) => ({
  slug,
  label: CATEGORY_LABELS[slug],
  imageUri: unsplash(imagePool[slug][0]),
}));

export default function CategoriesScreen() {
  const router = useRouter();
  const categories = useTasteStore((state) => state.selections.categories);
  const setSelections = useTasteStore((state) => state.setSelections);

  const toggleCategory = (slug: CategorySlug) => {
    setSelections({
      categories: categories.includes(slug)
        ? categories.filter((category) => category !== slug)
        : [...categories, slug],
    });
  };

  return (
    <OnboardingScaffold
      step={2}
      totalSteps={4}
      title="Qu’est-ce qui t’intéresse en ce moment ?"
      subtitle="Ces catégories seront mises en avant dans ton feed."
      ctaLabel="Continuer"
      ctaDisabled={categories.length === 0}
      onCta={() => router.push('/(onboarding)/budget')}
      onBack={() => router.back()}
    >
      <View style={styles.grid}>
        {categoryOptions.map((category) => (
          <SelectableTile
            key={category.slug}
            label={category.label}
            imageUri={category.imageUri}
            selected={categories.includes(category.slug)}
            onPress={() => toggleCategory(category.slug)}
            style={styles.tile}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
  },
});
