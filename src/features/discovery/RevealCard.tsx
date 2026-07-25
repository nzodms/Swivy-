import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, TasteSpectrum } from '@/components';
import { buildStyleSummary } from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, shadows, spacing } from '@/theme';
import type { RevealContent } from '@/features/recommendations';

interface RevealCardProps {
  reveal: RevealContent;
}

/**
 * Moment de révélation — carte éditoriale insérée dans le deck.
 * Fond cuivré doux, voix serif, spectre de goût réel.
 * Se balaie comme n'importe quelle carte.
 */
export function RevealCard({ reveal }: RevealCardProps) {
  const profile = useTasteStore((state) => state.profile);
  const likedProducts = useLikedProducts();
  const summary = useMemo(() => buildStyleSummary(profile, likedProducts), [profile, likedProducts]);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Sparkles size={20} color={colors.copper} strokeWidth={2} />
      </View>
      <AppText variant="editorial" align="center">
        {reveal.title}
      </AppText>
      <AppText variant="bodySmall" align="center" style={styles.body}>
        {reveal.body}
      </AppText>
      <View style={styles.spectrum}>
        <TasteSpectrum summary={summary} />
      </View>
      <AppText variant="micro" style={styles.hint}>
        Balaie pour continuer
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    backgroundColor: colors.copperSoft,
    borderWidth: 1,
    borderColor: '#EBD9CC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.sm,
  },
  spectrum: {
    alignSelf: 'stretch',
    marginTop: spacing.xs,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.lg,
    color: colors.textTertiary,
  },
});
