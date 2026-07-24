import { Text, type TextProps } from 'react-native';

import { colors, typography, type AppColor, type TypographyVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: AppColor;
  align?: 'left' | 'center' | 'right';
}

/**
 * Texte typographié. Toujours utiliser AppText plutôt que Text
 * pour garantir la cohérence de la hiérarchie.
 */
export function AppText({
  variant = 'body',
  color,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        color ? { color: colors[color] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
