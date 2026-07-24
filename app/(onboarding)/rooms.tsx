import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SelectableTile } from '@/features/onboarding/SelectableTile';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { roomOptions } from '@/mocks/rooms';
import { useTasteStore } from '@/stores/tasteStore';
import { spacing } from '@/theme';
import type { RoomSlug } from '@/types';

export default function RoomsScreen() {
  const router = useRouter();
  const rooms = useTasteStore((state) => state.selections.rooms);
  const setSelections = useTasteStore((state) => state.setSelections);

  const toggleRoom = (slug: RoomSlug) => {
    setSelections({
      rooms: rooms.includes(slug) ? rooms.filter((room) => room !== slug) : [...rooms, slug],
    });
  };

  return (
    <OnboardingScaffold
      step={1}
      totalSteps={4}
      title="Quelles pièces veux-tu transformer ?"
      subtitle="Sélectionne autant de pièces que tu veux."
      ctaLabel="Continuer"
      ctaDisabled={rooms.length === 0}
      onCta={() => router.push('/(onboarding)/categories')}
      onBack={() => router.back()}
    >
      <View style={styles.grid}>
        {roomOptions.map((room) => (
          <SelectableTile
            key={room.slug}
            label={room.label}
            imageUri={room.imageUri}
            selected={rooms.includes(room.slug)}
            onPress={() => toggleRoom(room.slug)}
            style={styles.tile}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
  },
});
