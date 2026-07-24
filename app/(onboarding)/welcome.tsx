import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppButton, AppScreen, AppText } from '@/components';
import { track } from '@/features/analytics/track';
import { products } from '@/mocks/products';
import { colors, radius, shadows, spacing } from '@/theme';

/** Visuel d'accueil : trois cartes produits qui se chevauchent. */
const PREVIEW_PRODUCTS = [products[0], products[9], products[33]].filter(
  (p): p is NonNullable<typeof p> => p !== undefined,
);

const CARD_TRANSFORMS = [
  { rotate: '-7deg', translateX: -68, translateY: 12 },
  { rotate: '6deg', translateX: 68, translateY: 20 },
  { rotate: '0deg', translateX: 0, translateY: 0 },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <AppText variant="heading" style={styles.wordmark}>
            Swivy
          </AppText>
        </Animated.View>

        <View style={styles.cardsPreview}>
          {PREVIEW_PRODUCTS.map((product, index) => {
            const transform = CARD_TRANSFORMS[index] ?? CARD_TRANSFORMS[2];
            return (
              <Animated.View
                key={product.id}
                entering={FadeInUp.delay(150 + index * 110).duration(450)}
                style={[
                  styles.previewCard,
                  transform && {
                    transform: [
                      { translateX: transform.translateX },
                      { translateY: transform.translateY },
                      { rotate: transform.rotate },
                    ],
                    zIndex: index,
                  },
                ]}
              >
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.copy}>
          <AppText variant="display" align="center">
            Les produits qui correspondent vraiment à ton style.
          </AppText>
          <AppText variant="bodySmall" align="center" style={styles.tagline}>
            Swipe, aime, et laisse Swivy apprendre tes goûts pour te proposer une
            décoration à ta hauteur.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.footer}>
        <AppButton
          label="Découvrir mon style"
          onPress={() => {
            track('onboarding_started', { screen: 'welcome' });
            router.push('/(onboarding)/rooms');
          }}
          accessibilityHint="Commence la découverte de ton profil déco"
        />
        <Link href="/(auth)/sign-in" asChild>
          <AppText variant="caption" align="center" style={styles.signInLink} accessibilityRole="link">
            J’ai déjà un compte
          </AppText>
        </Link>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  wordmark: {
    letterSpacing: -0.5,
    color: colors.accentDeep,
  },
  cardsPreview: {
    height: 240,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    position: 'absolute',
    width: 150,
    height: 210,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 4,
    borderColor: colors.background,
    ...shadows.card,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  copy: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tagline: {
    paddingHorizontal: spacing.md,
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  signInLink: {
    color: colors.textSecondary,
    textDecorationLine: 'underline',
    paddingVertical: spacing.xs,
  },
});
