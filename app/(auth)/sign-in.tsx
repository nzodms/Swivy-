import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, IconButton } from '@/components';
import { AuthTextField } from '@/features/auth/AuthTextField';
import { signInSchema, type SignInValues } from '@/features/auth/authSchemas';
import { useAuth } from '@/features/auth/useAuth';
import { colors, screenPadding, spacing } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submitting, signInWithEmail, signInWithProvider } = useAuth();

  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const success = await signInWithEmail(values);
    if (success) router.dismissTo('/(tabs)');
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.md }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.closeRow}>
          <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Fermer" size={40} iconSize={18} />
        </View>

        <View style={styles.titles}>
          <AppText variant="title">Content de te revoir</AppText>
          <AppText variant="bodySmall">
            Retrouve ta wishlist et ton profil esthétique sur tous tes appareils.
          </AppText>
        </View>

        <View style={styles.form}>
          <AuthTextField
            control={control}
            name="email"
            label="Email"
            placeholder="toi@exemple.fr"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <AuthTextField
            control={control}
            name="password"
            label="Mot de passe"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />
          <AppButton
            label="Se connecter"
            onPress={() => {
              void onSubmit();
            }}
            loading={submitting}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <AppText variant="micro" style={styles.dividerLabel}>
            ou
          </AppText>
          <View style={styles.divider} />
        </View>

        <View style={styles.providers}>
          <AppButton
            label="Continuer avec Google"
            variant="secondary"
            onPress={() => {
              void signInWithProvider('google');
            }}
          />
          <AppButton
            label="Continuer avec Apple"
            variant="secondary"
            onPress={() => {
              void signInWithProvider('apple');
            }}
          />
        </View>

        <View style={styles.footer}>
          <AppText variant="caption">Pas encore de compte ?</AppText>
          <Link href="/(auth)/sign-up" asChild>
            <AppText variant="caption" style={styles.link} accessibilityRole="link">
              Créer un compte
            </AppText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  closeRow: {
    alignItems: 'flex-end',
  },
  titles: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    color: colors.textTertiary,
  },
  providers: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  link: {
    color: colors.accentDeep,
    textDecorationLine: 'underline',
  },
});
