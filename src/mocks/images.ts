/**
 * Banque d'images de démonstration (licence Unsplash, exploitable légalement).
 * Chaque produit référence des photos d'intérieurs réels pour juger le design.
 */
const UNSPLASH = 'https://images.unsplash.com';
const PARAMS = 'auto=format&fit=crop&w=1000&q=80';

export function unsplash(photoId: string): string {
  return `${UNSPLASH}/photo-${photoId}?${PARAMS}`;
}

export const imagePool = {
  canapes: [
    '1555041469-a586c61ea9bc',
    '1540574163026-643ea20ade25',
    '1617806118233-18e1de247200',
    '1493663284031-b7e3aefcae8e',
    '1554995207-c18c203602cb',
    '1522708323590-d24dbb6b0267',
    '1493809842364-78817add7ffb',
    '1616486338812-3dadae4b4ace',
  ],
  fauteuils: [
    '1586023492125-27b2c045efd7',
    '1519947486511-46149fa0a254',
    '1506439773649-6e0eb8cfb237',
    '1567016432779-094069958ea5',
    '1484101403633-562f891dc89a',
    '1513506003901-1e6a229e2d15',
  ],
  tables: [
    '1524758631624-e2822e304c36',
    '1519710164239-da123dc03ef4',
    '1449247709967-d4461a6a6103',
    '1600585154340-be6161a56a0c',
    '1533090481720-856c6e3c1fdc',
  ],
  chaises: [
    '1503602642458-232111445657',
    '1592078615290-033ee584e267',
    '1519947486511-46149fa0a254',
    '1524758631624-e2822e304c36',
  ],
  luminaires: [
    '1567538096630-e0c55bd6374c',
    '1507473885765-e6ed057f782c',
    '1555636222-cae831e670b3',
    '1531835551805-16d864c8d311',
    '1513506003901-1e6a229e2d15',
  ],
  tapis: [
    '1600607687939-ce8a6c25118c',
    '1600566753086-00f18fb6b3ea',
    '1554995207-c18c203602cb',
    '1493809842364-78817add7ffb',
  ],
  rangements: [
    '1594620302200-9a762244a156',
    '1538688525198-9b88f6f53126',
    '1517705008128-361805f42e86',
    '1600210492486-724fe5c67fb0',
    '1600121848594-d8644e57abab',
  ],
  'objets-deco': [
    '1513161455079-7dc1de15ef3e',
    '1583847268964-b28dc8f51f92',
    '1600607687939-ce8a6c25118c',
    '1505693416388-ac5ce068fe85',
    '1618220179428-22790b461013',
  ],
} as const;

export type ImagePoolCategory = keyof typeof imagePool;

export function imagesFor(category: ImagePoolCategory, primaryIndex: number, count = 3): string[] {
  const pool = imagePool[category];
  const urls: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const photoId = pool[(primaryIndex + i) % pool.length];
    if (photoId) urls.push(unsplash(photoId));
  }
  return urls;
}
