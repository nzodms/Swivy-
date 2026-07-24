import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const IMAGE_PLACEHOLDER = { blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' } as const;

/** Galerie d'images de la fiche produit, avec pagination par points. */
export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(uri) => uri}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item, index }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height: width * 1.05 }}
            contentFit="cover"
            transition={200}
            placeholder={IMAGE_PLACEHOLDER}
            cachePolicy="memory-disk"
            accessibilityLabel={`Photo ${index + 1} de ${productName}`}
          />
        )}
      />
      {images.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {images.map((uri, index) => (
            <View key={uri} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
  },
});
