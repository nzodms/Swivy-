import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components';
import { colors, fontFamily, radius, spacing } from '@/theme';

interface AuthTextFieldProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

/** Champ de formulaire contrôlé par React Hook Form, avec erreur inline. */
export function AuthTextField<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: AuthTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={styles.field}>
          <AppText variant="caption" style={styles.label}>
            {label}
          </AppText>
          <TextInput
            {...inputProps}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            style={[styles.input, error && styles.inputError]}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={label}
          />
          {error ? (
            <AppText variant="micro" style={styles.error}>
              {error.message}
            </AppText>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xxs,
  },
  label: {
    color: colors.textSecondary,
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
  },
});
