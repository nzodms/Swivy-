import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { BudgetRangeSlider } from '@/features/onboarding/BudgetRangeSlider';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { useHaptics } from '@/hooks/useHaptics';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, spacing } from '@/theme';
import { PRICE_BAND_LABELS, priceBandSchema, type PriceBand } from '@/types';

interface BudgetOption {
  band: PriceBand | null;
  label: string;
  hint: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { band: 'under-100', label: PRICE_BAND_LABELS['under-100'], hint: 'Objets et petites pièces' },
  { band: '100-300', label: PRICE_BAND_LABELS['100-300'], hint: 'Luminaires, chaises, tapis' },
  { band: '300-700', label: PRICE_BAND_LABELS['300-700'], hint: 'Fauteuils, tables, rangements' },
  { band: 'over-700', label: PRICE_BAND_LABELS['over-700'], hint: 'Canapés et pièces maîtresses' },
  { band: null, label: 'Aucun budget précis', hint: 'Montre-moi tout, je fais le tri' },
];

export default function BudgetScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const priceBand = useTasteStore((state) => state.selections.priceBand);
  const priceRange = useTasteStore((state) => state.selections.priceRange);
  const setSelections = useTasteStore((state) => state.setSelections);

  return (
    <OnboardingScaffold
      step={3}
      totalSteps={4}
      title="Quel budget te semble juste ?"
      subtitle="Un ordre de grandeur suffit — tu pourras toujours l’ajuster."
      ctaLabel="Continuer"
      onCta={() => router.push('/(onboarding)/calibration')}
      onBack={() => router.back()}
    >
      <View style={styles.options}>
        {BUDGET_OPTIONS.map((option) => {
          const selected = priceBand === option.band;
          return (
            <Pressable
              key={option.label}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => {
                haptics.selection();
                setSelections({ priceBand: option.band });
              }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.optionText}>
                <AppText variant="bodyMedium" style={selected ? styles.optionLabelSelected : undefined}>
                  {option.label}
                </AppText>
                <AppText variant="caption">{option.hint}</AppText>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sliderSection}>
        <AppText variant="caption" style={styles.sliderTitle}>
          Ou définis ta propre fourchette
        </AppText>
        <BudgetRangeSlider
          min={0}
          max={2000}
          step={50}
          initialMin={priceRange?.min ?? 100}
          initialMax={priceRange?.max ?? 800}
          onChange={(min, max) => {
            const band = priceBandSchema.safeParse(
              max < 100 ? 'under-100' : max < 300 ? '100-300' : max < 700 ? '300-700' : 'over-700',
            );
            setSelections({
              priceRange: { min, max },
              priceBand: band.success ? band.data : null,
            });
          }}
        />
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionText: {
    flex: 1,
    gap: 1,
  },
  optionLabelSelected: {
    color: colors.accentDeep,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  sliderSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sliderTitle: {
    color: colors.textSecondary,
  },
});
