import { ArrowLeft } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppScreen, AppText, IconButton } from '@/components';
import { OnboardingProgress } from './OnboardingProgress';
import { spacing } from '@/theme';

interface OnboardingScaffoldProps extends PropsWithChildren {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  onBack?: () => void;
  /** Contenu scrollable (grilles) ou fixe (deck de calibration). */
  scrollable?: boolean;
}

/** Gabarit commun des étapes d'onboarding. */
export function OnboardingScaffold({
  step,
  totalSteps,
  title,
  subtitle,
  ctaLabel,
  ctaDisabled = false,
  onCta,
  onBack,
  scrollable = true,
  children,
}: OnboardingScaffoldProps) {
  const content = (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
      {children}
    </Animated.View>
  );

  return (
    <AppScreen>
      <View style={styles.topBar}>
        {onBack ? (
          <IconButton icon={ArrowLeft} onPress={onBack} accessibilityLabel="Étape précédente" size={40} iconSize={19} />
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <OnboardingProgress step={step} totalSteps={totalSteps} />
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.titles}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}

      <View style={styles.footer}>
        <AppButton label={ctaLabel} onPress={onCta} disabled={ctaDisabled} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  backPlaceholder: {
    width: 40,
  },
  titles: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xxs,
  },
  subtitle: {},
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
