import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { spacing } from '@/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Action à droite (bouton filtres, réglages…). */
  trailing?: ReactNode;
  /** Action à gauche (retour…). */
  leading?: ReactNode;
}

/** Header d'écran léger : titre fort, actions discrètes. */
export function AppHeader({ title, subtitle, trailing, leading }: AppHeaderProps) {
  return (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.titles}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  titles: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  leading: {
    marginRight: spacing.xs,
  },
  trailing: {
    marginLeft: spacing.xs,
  },
});
