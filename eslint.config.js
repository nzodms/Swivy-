const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**', 'supabase/**'],
  },
  {
    rules: {
      // Écrire `sharedValue.value = withSpring(...)` dans un gestionnaire
      // d'événement est l'API officielle de Reanimated ; la règle
      // d'immutabilité du compilateur React la signale à tort.
      'react-hooks/immutability': 'off',
    },
  },
]);
