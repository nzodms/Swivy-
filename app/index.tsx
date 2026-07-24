import { Redirect } from 'expo-router';

import { useTasteStore } from '@/stores/tasteStore';

/** Aiguillage de démarrage : onboarding la première fois, feed ensuite. */
export default function Index() {
  const onboardingComplete = useTasteStore((state) => state.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
