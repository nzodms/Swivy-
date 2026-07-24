import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { SwipeActionBar } from '@/features/discovery/SwipeActionBar';
import { SwipeDeck, type SwipeDeckHandle } from '@/features/discovery/SwipeDeck';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { compatibilityPercent } from '@/features/recommendations';
import { calibrationProducts } from '@/mocks/calibration';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, spacing } from '@/theme';
import type { Product, SwipeAction } from '@/types';

/**
 * Calibration visuelle : l'utilisateur swipe une douzaine de pièces
 * contrastées pour entraîner son profil initial.
 */
export default function CalibrationScreen() {
  const router = useRouter();
  const deckRef = useRef<SwipeDeckHandle>(null);

  const profile = useTasteStore((state) => state.profile);
  const recordSwipe = useTasteStore((state) => state.recordSwipe);
  const seedProfileFromSelections = useTasteStore((state) => state.seedProfileFromSelections);

  const [remaining, setRemaining] = useState<Product[]>(calibrationProducts);
  const seeded = useRef(false);

  // Les choix des étapes précédentes deviennent les premiers signaux du profil.
  if (!seeded.current) {
    seeded.current = true;
    seedProfileFromSelections();
  }

  const total = calibrationProducts.length;
  const done = total - remaining.length;
  const progressPercent = Math.round((done / total) * 100);

  const progressLabel = useMemo(() => {
    if (progressPercent >= 100) return 'Ton profil est prêt';
    if (progressPercent >= 70) return 'Ton style se précise nettement';
    if (progressPercent >= 40) return 'Ton style se précise';
    return 'Swipe pour situer tes goûts';
  }, [progressPercent]);

  const handleSwipe = (product: Product, action: SwipeAction) => {
    recordSwipe(product, action, 'calibration');
    const next = remaining.filter((candidate) => candidate.id !== product.id);
    setRemaining(next);
    if (next.length === 0) {
      // Laisse la dernière carte finir sa sortie avant la transition.
      setTimeout(() => router.push('/(onboarding)/result'), 350);
    }
  };

  return (
    <OnboardingScaffold
      step={4}
      totalSteps={4}
      title="Calibrons ton œil"
      subtitle="Aime ou écarte ces ambiances — ton profil apprend à chaque geste."
      ctaLabel={remaining.length === 0 ? 'Voir mon profil' : `Encore ${remaining.length} cartes`}
      ctaDisabled={remaining.length > 0}
      onCta={() => router.push('/(onboarding)/result')}
      onBack={() => router.back()}
      scrollable={false}
    >
      <View style={styles.progressRow}>
        <AppText variant="caption" style={styles.progressLabel}>
          {progressLabel}
        </AppText>
        <AppText variant="caption" style={styles.progressPercent}>
          {progressPercent} %
        </AppText>
      </View>

      <View style={styles.deckArea}>
        <SwipeDeck
          ref={deckRef}
          products={remaining}
          compatibilityFor={(product) => compatibilityPercent(profile, product)}
          onSwipe={handleSwipe}
          onPressDetails={() => undefined}
        />
      </View>

      <SwipeActionBar
        disabled={remaining.length === 0}
        onDislike={() => deckRef.current?.swipeTop('dislike')}
        onLike={() => deckRef.current?.swipeTop('like')}
        onSuperlike={() => deckRef.current?.swipeTop('superlike')}
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressPercent: {
    color: colors.accentDeep,
  },
  deckArea: {
    flex: 1,
  },
});
