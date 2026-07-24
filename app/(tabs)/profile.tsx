import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Eye, LogIn, LogOut, RefreshCcw, ShieldCheck } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppHeader, AppScreen, AppText } from '@/components';
import { StyleDnaCard } from '@/features/profile/StyleDnaCard';
import { buildStyleSummary } from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { colors, radius, shadows, spacing } from '@/theme';
import { confirmDialog, infoDialog } from '@/utils/dialogs';

/** Nombre de signaux à partir duquel le profil est considéré comme mûr. */
const MATURE_SIGNAL_COUNT = 60;

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useTasteStore((state) => state.profile);
  const swipes = useTasteStore((state) => state.swipes);
  const hiddenProductIds = useTasteStore((state) => state.hiddenProductIds);
  const unhideProduct = useTasteStore((state) => state.unhideProduct);
  const resetAll = useTasteStore((state) => state.resetAll);
  const likedProducts = useLikedProducts();
  const favorites = useFavoritesStore((state) => state.favorites);
  const user = useSessionStore((state) => state.user);
  const signOut = useSessionStore((state) => state.signOut);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const showToast = useToastStore((state) => state.show);

  const summary = useMemo(() => buildStyleSummary(profile, likedProducts), [profile, likedProducts]);
  const maturity = Math.min(100, Math.round((profile.signalCount / MATURE_SIGNAL_COUNT) * 100));

  const superlikeCount = swipes.filter((swipe) => swipe.action === 'superlike').length;
  const likeCount = swipes.filter((swipe) => swipe.action === 'like').length;

  const displayName = user?.firstName ?? 'Invité';
  const initials = displayName.slice(0, 2).toUpperCase();

  const confirmReset = () => {
    confirmDialog({
      title: 'Réinitialiser mon profil',
      message:
        'Tes swipes, ton profil esthétique et ton onboarding seront effacés. Tes favoris sont conservés.',
      confirmLabel: 'Réinitialiser',
      destructive: true,
      onConfirm: () => {
        resetAll();
        router.replace('/(onboarding)/welcome');
      },
    });
  };

  const restoreHidden = () => {
    hiddenProductIds.forEach(unhideProduct);
    showToast('Produits masqués restaurés', 'success');
  };

  return (
    <AppScreen padded={false} withBottomNav>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.padded}>
          <AppHeader title="Profil" />

          {/* Identité — appui long sur l'avatar : écran de diagnostic interne */}
          <View style={styles.identityCard}>
            <Pressable
              accessibilityLabel="Avatar"
              onLongPress={() => router.push('/dev/diagnostics')}
              delayLongPress={600}
              style={styles.avatar}
            >
              <AppText variant="heading" style={styles.avatarText}>
                {initials}
              </AppText>
            </Pressable>
            <View style={styles.identityText}>
              <AppText variant="subheading">{displayName}</AppText>
              <AppText variant="caption">
                {user ? user.email : 'Profil local, sans compte'}
              </AppText>
            </View>
          </View>

          {/* Progression du profil esthétique */}
          <View style={styles.sectionCard}>
            <View style={styles.progressHeader}>
              <AppText variant="subheading">Profil esthétique</AppText>
              <AppText variant="caption" style={styles.progressValue}>
                précis à {maturity} %
              </AppText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(4, maturity)}%` }]} />
            </View>
            <AppText variant="caption">
              {maturity < 100
                ? 'Continue de swiper : chaque geste précise tes recommandations.'
                : 'Ton profil est mûr — les recommandations sont à leur meilleur.'}
            </AppText>
          </View>

          {/* ADN esthétique */}
          <View style={styles.section}>
            <AppText variant="heading">Ton ADN esthétique</AppText>
            <StyleDnaCard summary={summary} moodboardProducts={likedProducts.slice(0, 4)} />
          </View>

          {/* Historique */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <AppText variant="title">{swipes.length}</AppText>
              <AppText variant="micro" style={styles.statLabel}>
                swipes
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText variant="title">{likeCount}</AppText>
              <AppText variant="micro" style={styles.statLabel}>
                j’aime
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText variant="title">{superlikeCount}</AppText>
              <AppText variant="micro" style={styles.statLabel}>
                coups de cœur
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText variant="title">{favorites.length}</AppText>
              <AppText variant="micro" style={styles.statLabel}>
                favoris
              </AppText>
            </View>
          </View>

          {/* Réglages */}
          <View style={styles.section}>
            <AppText variant="heading">Réglages</AppText>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Bell size={19} color={colors.textSecondary} strokeWidth={2} />
                <AppText variant="bodyMedium" style={styles.settingLabel}>
                  Notifications
                </AppText>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ true: colors.accent, false: colors.borderStrong }}
                  thumbColor={colors.surface}
                  accessibilityLabel="Activer les notifications"
                />
              </View>

              <View style={styles.divider} />
              <Pressable
                accessibilityRole="button"
                style={styles.settingRow}
                onPress={() =>
                  infoDialog(
                    'Confidentialité',
                    'Ton profil esthétique est calculé et stocké sur ton appareil. Aucune donnée de swipe n’est partagée sans compte.',
                  )
                }
              >
                <ShieldCheck size={19} color={colors.textSecondary} strokeWidth={2} />
                <AppText variant="bodyMedium" style={styles.settingLabel}>
                  Confidentialité
                </AppText>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>

              {hiddenProductIds.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  <Pressable accessibilityRole="button" style={styles.settingRow} onPress={restoreHidden}>
                    <Eye size={19} color={colors.textSecondary} strokeWidth={2} />
                    <AppText variant="bodyMedium" style={styles.settingLabel}>
                      Restaurer {hiddenProductIds.length} produit
                      {hiddenProductIds.length > 1 ? 's' : ''} masqué
                      {hiddenProductIds.length > 1 ? 's' : ''}
                    </AppText>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </Pressable>
                </>
              ) : null}

              <View style={styles.divider} />
              <Pressable accessibilityRole="button" style={styles.settingRow} onPress={confirmReset}>
                <RefreshCcw size={19} color={colors.dislike} strokeWidth={2} />
                <AppText variant="bodyMedium" style={[styles.settingLabel, styles.dangerText]}>
                  Réinitialiser mon profil
                </AppText>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>

              <View style={styles.divider} />
              {user ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.settingRow}
                  onPress={() => {
                    signOut();
                    showToast('Tu es déconnecté', 'info');
                  }}
                >
                  <LogOut size={19} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="bodyMedium" style={styles.settingLabel}>
                    Se déconnecter
                  </AppText>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  style={styles.settingRow}
                  onPress={() => router.push('/(auth)/sign-in')}
                >
                  <LogIn size={19} color={colors.accentDeep} strokeWidth={2} />
                  <AppText variant="bodyMedium" style={[styles.settingLabel, styles.accentText]}>
                    Créer un compte ou se connecter
                  </AppText>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accentDeep,
  },
  identityText: {
    gap: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.subtle,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressValue: {
    color: colors.accentDeep,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  section: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  settingLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dangerText: {
    color: colors.dislike,
  },
  accentText: {
    color: colors.accentDeep,
  },
});
