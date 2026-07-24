import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, IconButton } from '@/components';
import { AuthTextField } from '@/features/auth/AuthTextField';
import { signUpSchema, type SignUpValues } from '@/features/auth/authSchemas';
import { useAuth } from '@/features/auth/useAuth';
import { colors, screenPadding, spacing } from '@/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submitting, signUpWithEmail } = useAuth();

  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const success = await signUpWithEmail(values);
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
          <IconButton
            icon={ArrowLeft}
            onPress={() => router.back()}
            accessibilityLabel="Retour"
            size={40}
            iconSize={18}
          />
        </View>

        <View style={styles.titles}>
          <AppText variant="title">Garde ton style avec toi</AppText>
          <AppText variant="bodySmall">
            Ton profil esthétique et ta wishlist, synchronisés et retrouvables partout.
          </AppText>
        </View>

        <View style={styles.form}>
          <AuthTextField
            control={control}
            name="firstName"
            label="Prénom"
            placeholder="Camille"
            autoComplete="given-name"
          />
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
            placeholder="8 caractères minimum"
            secureTextEntry
            autoComplete="new-password"
          />
          <AppButton
            label="Créer mon compte"
            onPress={() => {
              void onSubmit();
            }}
            loading={submitting}
          />
        </View>

        <AppText variant="micro" style={styles.legal}>
          En créant un compte, tu acceptes que ton profil esthétique soit sauvegardé
          pour personnaliser tes recommandations.
        </AppText>
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
    alignItems: 'flex-start',
  },
  titles: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  legal: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
