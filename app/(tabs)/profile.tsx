import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Minus,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppText, AppScreen, StyleTag, TasteSpectrum } from '@/components';
import { boldnessLabel, buildStyleSummary, topEntries } from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { colors, radius, screenPadding, spacing } from '@/theme';
import { STYLE_LABELS, type StyleSlug } from '@/types';
import { confirmDialog, infoDialog } from '@/utils/dialogs';

/** Nombre de signaux à partir duquel le profil est considéré comme mûr. */
const MATURE_SIGNAL_COUNT = 60;

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useTasteStore((state) => state.profile);
  const swipes = useTasteStore((state) => state.swipes);
  const hiddenProductIds = useTasteStore((state) => state.hiddenProductIds);
  const hiddenBrands = useTasteStore((state) => state.hiddenBrands);
  const unhideProduct = useTasteStore((state) => state.unhideProduct);
  const toggleBrandHidden = useTasteStore((state) => state.toggleBrandHidden);
  const softenPreference = useTasteStore((state) => state.softenPreference);
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

  const learnedStyles = topEntries(profile.styles, 4);
  const learnedMaterials = topEntries(profile.materials, 4);
  const learnedColors = topEntries(profile.colors, 4);
  const likedBrands = topEntries(profile.brands, 4);

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

  const soften = (dimension: 'styles' | 'materials' | 'colors', key: string, label: string) => {
    confirmDialog({
      title: `Moins de « ${label} »`,
      message: 'Cette préférence apprise sera fortement atténuée. Elle pourra se reconstruire si tu aimes à nouveau ce type de pièces.',
      confirmLabel: 'Atténuer',
      onConfirm: () => {
        softenPreference(dimension, key);
        showToast(`« ${label} » atténué dans tes recommandations`, 'success');
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
          {/* Identité — appui long sur l'avatar : écran de diagnostic interne */}
          <View style={styles.identityRow}>
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
              <AppText variant="title">{displayName}</AppText>
              <AppText variant="caption">{user ? user.email : 'Profil local, sans compte'}</AppText>
            </View>
          </View>

          {/* Spectre de goût — signature */}
          <View style={styles.spectrumCard}>
            <View style={styles.spectrumHeader}>
              <AppText variant="heading">Ton spectre de goût</AppText>
              <AppText variant="caption" style={styles.maturity}>
                compris à {maturity} %
              </AppText>
            </View>
            <TasteSpectrum summary={summary} />
            <View style={styles.spectrumMeta}>
              <View style={styles.metaItem}>
                <AppText variant="micro" style={styles.metaLabel}>
                  Exploration
                </AppText>
                <AppText variant="caption" style={styles.metaValue}>
                  {boldnessLabel(summary.boldness)}
                </AppText>
              </View>
              {summary.averageBudget !== null ? (
                <View style={styles.metaItem}>
                  <AppText variant="micro" style={styles.metaLabel}>
                    Budget moyen aimé
                  </AppText>
                  <AppText variant="caption" style={styles.metaValue}>
                    {summary.averageBudget.toLocaleString('fr-FR')} €
                  </AppText>
                </View>
              ) : null}
              <View style={styles.metaItem}>
                <AppText variant="micro" style={styles.metaLabel}>
                  Activité
                </AppText>
                <AppText variant="caption" style={styles.metaValue}>
                  {swipes.length} swipes · {likeCount} j’aime · {superlikeCount} coups de cœur ·{' '}
                  {favorites.length} favoris
                </AppText>
              </View>
            </View>
          </View>

          {/* Préférences apprises — modifiables */}
          {learnedStyles.length + learnedMaterials.length + learnedColors.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="heading">Préférences apprises</AppText>
              <AppText variant="caption">
                Touche une préférence pour l’atténuer si elle ne te ressemble plus.
              </AppText>
              <View style={styles.prefGroups}>
                {learnedStyles.length > 0 ? (
                  <View style={styles.prefGroup}>
                    <AppText variant="micro" style={styles.prefLabel}>
                      Styles
                    </AppText>
                    <View style={styles.prefChips}>
                      {learnedStyles.map(([style]) => {
                        const label = STYLE_LABELS[style as StyleSlug] ?? style;
                        return (
                          <Pressable
                            key={style}
                            accessibilityRole="button"
                            accessibilityLabel={`Atténuer la préférence ${label}`}
                            onPress={() => soften('styles', style, label)}
                            style={styles.prefChip}
                          >
                            <AppText variant="caption" style={styles.prefChipText}>
                              {label}
                            </AppText>
                            <Minus size={12} color={colors.textTertiary} strokeWidth={2.4} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                {learnedMaterials.length > 0 ? (
                  <View style={styles.prefGroup}>
                    <AppText variant="micro" style={styles.prefLabel}>
                      Matières
                    </AppText>
                    <View style={styles.prefChips}>
                      {learnedMaterials.map(([material]) => (
                        <Pressable
                          key={material}
                          accessibilityRole="button"
                          accessibilityLabel={`Atténuer la préférence ${material}`}
                          onPress={() => soften('materials', material, material)}
                          style={styles.prefChip}
                        >
                          <AppText variant="caption" style={styles.prefChipText}>
                            {material}
                          </AppText>
                          <Minus size={12} color={colors.textTertiary} strokeWidth={2.4} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
                {learnedColors.length > 0 ? (
                  <View style={styles.prefGroup}>
                    <AppText variant="micro" style={styles.prefLabel}>
                      Couleurs
                    </AppText>
                    <View style={styles.prefChips}>
                      {learnedColors.map(([color]) => (
                        <Pressable
                          key={color}
                          accessibilityRole="button"
                          accessibilityLabel={`Atténuer la préférence ${color}`}
                          onPress={() => soften('colors', color, color)}
                          style={styles.prefChip}
                        >
                          <AppText variant="caption" style={styles.prefChipText}>
                            {color}
                          </AppText>
                          <Minus size={12} color={colors.textTertiary} strokeWidth={2.4} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Marques */}
          {likedBrands.length > 0 || hiddenBrands.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="heading">Marques</AppText>
              {likedBrands.length > 0 ? (
                <View style={styles.brandRows}>
                  {likedBrands.map(([brand]) => {
                    const hidden = hiddenBrands.includes(brand);
                    return (
                      <View key={brand} style={styles.brandRow}>
                        <AppText
                          variant="bodyMedium"
                          style={hidden ? styles.brandHidden : undefined}
                        >
                          {brand}
                        </AppText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            hidden ? `Réafficher ${brand}` : `Masquer ${brand} du feed`
                          }
                          hitSlop={8}
                          onPress={() => {
                            toggleBrandHidden(brand);
                            showToast(
                              hidden ? `${brand} réaffichée` : `${brand} masquée du feed`,
                              'info',
                            );
                          }}
                          style={styles.brandAction}
                        >
                          {hidden ? (
                            <EyeOff size={16} color={colors.textTertiary} strokeWidth={2} />
                          ) : (
                            <Eye size={16} color={colors.textSecondary} strokeWidth={2} />
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              {hiddenBrands.filter((brand) => !likedBrands.some(([b]) => b === brand)).length > 0 ? (
                <View style={styles.hiddenBrandTags}>
                  {hiddenBrands
                    .filter((brand) => !likedBrands.some(([b]) => b === brand))
                    .map((brand) => (
                      <Pressable key={brand} onPress={() => toggleBrandHidden(brand)}>
                        <StyleTag label={`${brand} — masquée`} />
                      </Pressable>
                    ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Réglages */}
          <View style={styles.section}>
            <AppText variant="heading">Réglages</AppText>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Bell size={18} color={colors.textSecondary} strokeWidth={2} />
                <AppText variant="bodyMedium" style={styles.settingLabel}>
                  Notifications
                </AppText>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ true: colors.accent, false: colors.borderStrong }}
                  thumbColor={colors.background}
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
                <ShieldCheck size={18} color={colors.textSecondary} strokeWidth={2} />
                <AppText variant="bodyMedium" style={styles.settingLabel}>
                  Confidentialité
                </AppText>
                <ChevronRight size={17} color={colors.textTertiary} />
              </Pressable>

              {hiddenProductIds.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  <Pressable accessibilityRole="button" style={styles.settingRow} onPress={restoreHidden}>
                    <Eye size={18} color={colors.textSecondary} strokeWidth={2} />
                    <AppText variant="bodyMedium" style={styles.settingLabel}>
                      Restaurer {hiddenProductIds.length} produit
                      {hiddenProductIds.length > 1 ? 's' : ''} masqué
                      {hiddenProductIds.length > 1 ? 's' : ''}
                    </AppText>
                    <ChevronRight size={17} color={colors.textTertiary} />
                  </Pressable>
                </>
              ) : null}

              <View style={styles.divider} />
              <Pressable accessibilityRole="button" style={styles.settingRow} onPress={confirmReset}>
                <RefreshCcw size={18} color={colors.danger} strokeWidth={2} />
                <AppText variant="bodyMedium" style={[styles.settingLabel, styles.dangerText]}>
                  Réinitialiser mon profil
                </AppText>
                <ChevronRight size={17} color={colors.textTertiary} />
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
                  <LogOut size={18} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="bodyMedium" style={styles.settingLabel}>
                    Se déconnecter
                  </AppText>
                  <ChevronRight size={17} color={colors.textTertiary} />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  style={styles.settingRow}
                  onPress={() => router.push('/(auth)/sign-in')}
                >
                  <LogIn size={18} color={colors.accentDeep} strokeWidth={2} />
                  <AppText variant="bodyMedium" style={[styles.settingLabel, styles.accentText]}>
                    Créer un compte ou se connecter
                  </AppText>
                  <ChevronRight size={17} color={colors.textTertiary} />
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
    paddingBottom: 110,
  },
  padded: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.xs,
    gap: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accentDeep,
  },
  identityText: {
    gap: 1,
  },
  spectrumCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  spectrumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  maturity: {
    color: colors.accentDeep,
  },
  spectrumMeta: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  metaItem: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'baseline',
  },
  metaLabel: {
    width: 118,
    color: colors.textTertiary,
  },
  metaValue: {
    flex: 1,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.xs,
  },
  prefGroups: {
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  prefGroup: {
    gap: spacing.xxs,
  },
  prefLabel: {
    color: colors.textTertiary,
  },
  prefChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    height: 32,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  prefChipText: {
    color: colors.textPrimary,
  },
  brandRows: {
    marginTop: spacing.xxs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandHidden: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  brandAction: {
    padding: spacing.xxs,
  },
  hiddenBrandTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  settingsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xxs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 50,
  },
  settingLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dangerText: {
    color: colors.danger,
  },
  accentText: {
    color: colors.accentDeep,
  },
});
