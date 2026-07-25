import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface StyleTagProps {
  label: string;
  tone?: 'neutral' | 'accent' | 'copper';
}

/** Tag d'information V2 — rayon 8, discret ; jamais plus de 2 par rangée. */
export function StyleTag({ label, tone = 'neutral' }: StyleTagProps) {
  return (
    <View style={[styles.base, tone === 'accent' && styles.accent, tone === 'copper' && styles.copper]}>
      <AppText
        variant="micro"
        style={
          tone === 'accent' ? styles.accentText : tone === 'copper' ? styles.copperText : styles.neutralText
        }
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'flex-start',
  },
  accent: {
    backgroundColor: colors.accentSoft,
  },
  copper: {
    backgroundColor: colors.copperSoft,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  accentText: {
    color: colors.accentDeep,
  },
  copperText: {
    color: colors.copper,
  },
});
