import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface StyleTagProps {
  label: string;
  tone?: 'neutral' | 'accent';
}

/** Petit tag d'attribut (style, matière, couleur). */
export function StyleTag({ label, tone = 'neutral' }: StyleTagProps) {
  return (
    <View style={[styles.base, tone === 'accent' && styles.accent]}>
      <AppText variant="micro" style={tone === 'accent' ? styles.accentText : styles.neutralText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'flex-start',
  },
  accent: {
    backgroundColor: colors.accentSoft,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  accentText: {
    color: colors.accentDeep,
  },
});
