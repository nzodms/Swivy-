import { unsplash } from './images';
import { ROOM_LABELS, type RoomSlug } from '@/types';

/** Visuels des pièces pour l'onboarding. */
const ROOM_PHOTOS: Record<RoomSlug, string> = {
  salon: '1555041469-a586c61ea9bc',
  chambre: '1505693416388-ac5ce068fe85',
  cuisine: '1556909114-f6e7ad7d3136',
  bureau: '1538688525198-9b88f6f53126',
  'salle-a-manger': '1519710164239-da123dc03ef4',
  exterieur: '1600210492486-724fe5c67fb0',
};

export interface RoomOption {
  slug: RoomSlug;
  label: string;
  imageUri: string;
}

export const roomOptions: RoomOption[] = (Object.keys(ROOM_PHOTOS) as RoomSlug[]).map((slug) => ({
  slug,
  label: ROOM_LABELS[slug],
  imageUri: unsplash(ROOM_PHOTOS[slug]),
}));
