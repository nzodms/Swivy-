import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** État vide expressif — jamais un écran blanc muet. */
export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={30} color={colors.accent} strokeWidth={1.8} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="bodySmall" align="center" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Un petit accroc', message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="bodySmall" align="center" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <AppButton label="Réessayer" onPress={onRetry} style={styles.action} /> : null}
    </View>
  );
}

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.accent} />
      <AppText variant="bodySmall" style={styles.message}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
