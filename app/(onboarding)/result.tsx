import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppButton, AppScreen, AppText, StyleTag, TasteSpectrum } from '@/components';
import { track } from '@/features/analytics/track';
import { boldnessLabel, buildStyleSummary } from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, spacing } from '@/theme';
import { STYLE_LABELS } from '@/types';

const GENERATION_MS = 1600;

/** Fin d'onboarding : génération du profil puis première esquisse. */
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
            <AppText variant="editorial" style={styles.pulseText}>
              S
            </AppText>
          </Animated.View>
          <AppText variant="heading" align="center">
            Lecture de tes swipes…
          </AppText>
          <AppText variant="bodySmall" align="center">
            Nous croisons tes gestes, tes pièces et ton budget.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(350)} style={styles.titleBlock}>
          <AppText variant="micro" style={styles.eyebrow}>
            Première esquisse de ton profil
          </AppText>
          <AppText variant="editorialTitle">
            {dominant ? STYLE_LABELS[dominant.style] : 'Éclectique assumé'}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.card}>
          <TasteSpectrum summary={summary} />
          <View style={styles.tagsRow}>
            {summary.topMaterials.slice(0, 3).map((material) => (
              <StyleTag key={material} label={material} />
            ))}
            {summary.topColors.slice(0, 2).map((color) => (
              <StyleTag key={color} label={`tons ${color}`} tone="accent" />
            ))}
          </View>
          <AppText variant="caption" style={styles.boldness}>
            Niveau d’exploration : {boldnessLabel(summary.boldness)}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(350)}>
          <AppText variant="bodySmall">
            Ce n’est qu’un point de départ : chaque swipe continuera de l’affiner,
            discrètement.
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
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  pulseCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pulseText: {
    color: colors.accentDeep,
    fontSize: 40,
    lineHeight: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accentDeep,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
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
