import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppButton, AppScreen, AppText, PreferenceBar, StyleTag } from '@/components';
import { track } from '@/features/analytics/track';
import { boldnessLabel, buildStyleSummary } from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, shadows, spacing } from '@/theme';
import { STYLE_LABELS } from '@/types';

const GENERATION_MS = 1800;

/** Fin d'onboarding : génération du profil puis résultat provisoire. */
export default function ResultScreen() {
  const router = useRouter();
  const profile = useTasteStore((state) => state.profile);
  const completeOnboarding = useTasteStore((state) => state.completeOnboarding);
  const likedProducts = useLikedProducts();

  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGenerating(false), GENERATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => buildStyleSummary(profile, likedProducts), [profile, likedProducts]);
  const dominant = summary.dominantStyles[0];

  if (generating) {
    return (
      <AppScreen>
        <View style={styles.generating}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.pulseCircle}>
            <AppText variant="heading" style={styles.pulseText}>
              Swivy
            </AppText>
          </Animated.View>
          <AppText variant="heading" align="center">
            Génération de ton profil…
          </AppText>
          <AppText variant="bodySmall" align="center">
            Nous croisons tes swipes, tes pièces et ton budget.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <AppText variant="caption" style={styles.eyebrow}>
            Ton profil esthétique — première esquisse
          </AppText>
          <AppText variant="display">
            {dominant ? STYLE_LABELS[dominant.style] : 'Éclectique assumé'}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.card}>
          {summary.dominantStyles.length > 0 ? (
            <View style={styles.bars}>
              {summary.dominantStyles.map((entry) => (
                <PreferenceBar
                  key={entry.style}
                  label={STYLE_LABELS[entry.style]}
                  share={entry.share}
                />
              ))}
            </View>
          ) : (
            <AppText variant="bodySmall">
              Tes goûts sont encore ouverts : le feed va explorer plusieurs directions.
            </AppText>
          )}

          <View style={styles.tagsRow}>
            {summary.topMaterials.slice(0, 3).map((material) => (
              <StyleTag key={material} label={material} />
            ))}
            {summary.topColors.slice(0, 3).map((color) => (
              <StyleTag key={color} label={`tons ${color}`} tone="accent" />
            ))}
          </View>

          <AppText variant="caption" style={styles.boldness}>
            Niveau d’audace : {boldnessLabel(summary.boldness)}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(350)}>
          <AppText variant="bodySmall">
            Ce profil n’est qu’un point de départ : chaque swipe continuera de
            l’affiner, discrètement.
          </AppText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Commencer à découvrir"
          onPress={() => {
            track('onboarding_completed', { screen: 'result' });
            completeOnboarding();
            router.replace('/(tabs)');
          }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  generating: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pulseText: {
    color: colors.accentDeep,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  eyebrow: {
    color: colors.accentDeep,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.subtle,
  },
  bars: {
    gap: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  boldness: {
    color: colors.textSecondary,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
