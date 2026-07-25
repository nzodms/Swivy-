import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface SignalLineProps {
  text: string;
  /** copper = moment spécial (coup de cœur, révélation). */
  tone?: 'brand' | 'copper';
  /** Posé sur une photo (fond givré). */
  onImage?: boolean;
}

/**
 * La « ligne de signal » Swivy : une seule phrase de personnalisation,
 * toujours fondée sur une vraie donnée du profil.
 */
export function SignalLine({ text, tone = 'brand', onImage = false }: SignalLineProps) {
  const color = onImage ? colors.textPrimary : tone === 'copper' ? colors.copper : colors.accentDeep;
  return (
    <View
      accessibilityLabel={text}
      style={[
        styles.base,
        onImage ? styles.onImage : tone === 'copper' ? styles.copperBg : styles.brandBg,
      ]}
    >
      <Sparkles size={12} color={color} strokeWidth={2.4} />
      <AppText variant="micro" style={{ color }} numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  brandBg: {
    backgroundColor: colors.accentSoft,
  },
  copperBg: {
    backgroundColor: colors.copperSoft,
  },
  onImage: {
    backgroundColor: colors.frost,
  },
});
