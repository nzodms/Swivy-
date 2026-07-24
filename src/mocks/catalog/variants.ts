import type { SeedVariant } from './seed';

/**
 * Déclinaisons de couleurs et de matières.
 * Chaque variante est un produit à part entière dans le catalogue.
 */
export const variantSeeds: SeedVariant[] = [
  // Canapés
  { of: 'p-cana-aria', id: 'p-cana-aria-sauge', suffix: 'velours sauge', colors: ['vert sauge'], materials: ['velours', 'bois clair'], img: 5, priceDelta: 100 },
  { of: 'p-cana-aria', id: 'p-cana-aria-ecru', suffix: 'lin écru', colors: ['écru'], materials: ['lin lavé', 'bois clair'], img: 6 },
  { of: 'p-cana-brume', id: 'p-cana-brume-perle', suffix: 'gris perle', colors: ['gris perle'], img: 2 },
  { of: 'p-cana-oslo', id: 'p-cana-oslo-ocre', suffix: 'laine ocre', colors: ['ocre'], img: 7, priceDelta: 30 },
  { of: 'p-cana-terra', id: 'p-cana-terra-sable', suffix: 'lin sable', colors: ['sable'], img: 0 },
  { of: 'p-cana-dune', id: 'p-cana-dune-brume', suffix: 'bouclette brume', colors: ['gris perle'], img: 3 },
  { of: 'p-cana-nuage', id: 'p-cana-nuage-mineral', suffix: 'velours bleu minéral', colors: ['bleu minéral'], img: 4 },

  // Fauteuils
  { of: 'p-faut-galet', id: 'p-faut-galet-sauge', suffix: 'bouclette sauge', colors: ['vert sauge'], img: 3, priceDelta: 20 },
  { of: 'p-faut-galet', id: 'p-faut-galet-noisette', suffix: 'laine noisette', colors: ['noisette'], materials: ['laine bouclée', 'frêne'], img: 4 },
  { of: 'p-faut-kyoto', id: 'p-faut-kyoto-ecru', suffix: 'chêne clair', colors: ['naturel', 'écru'], img: 5 },
  { of: 'p-faut-velours', id: 'p-faut-velours-rose', suffix: 'velours rose poudré', colors: ['rose poudré'], img: 2 },
  { of: 'p-faut-bloc', id: 'p-faut-bloc-terracotta', suffix: 'terracotta', colors: ['terracotta'], img: 1, priceDelta: 0 },
  { of: 'p-faut-cannage', id: 'p-faut-cannage-noir', suffix: 'noir mat', colors: ['noir', 'naturel'], materials: ['hêtre teinté', 'cannage'], img: 3 },

  // Chaises
  { of: 'p-chai-ondine', id: 'p-chai-ondine-sauge', suffix: 'vert sauge', colors: ['vert sauge'], img: 1 },
  { of: 'p-chai-ondine', id: 'p-chai-ondine-ocre', suffix: 'ocre', colors: ['ocre'], img: 2, priceDelta: 0 },
  { of: 'p-chai-brasserie', id: 'p-chai-brasserie-noire', suffix: 'hêtre noirci', colors: ['noir'], img: 3 },
  { of: 'p-chai-velours', id: 'p-chai-velours-sauge', suffix: 'velours sauge', colors: ['vert sauge'], img: 0 },
  { of: 'p-chai-enoki', id: 'p-chai-enoki-clair', suffix: 'chêne naturel', colors: ['naturel'], materials: ['chêne', 'papier tressé'], img: 1 },
  { of: 'p-chai-jardin', id: 'p-chai-jardin-creme', suffix: 'crème', colors: ['crème'], img: 0 },

  // Tables
  { of: 'p-tabl-plateau', id: 'p-tabl-plateau-noyer', suffix: 'noyer', colors: ['noyer'], materials: ['noyer massif'], img: 3, priceDelta: 160 },
  { of: 'p-tabl-lune', id: 'p-tabl-lune-noire', suffix: 'marbre noir', colors: ['noir'], materials: ['marbre'], img: 4, priceDelta: 80 },
  { of: 'p-tabl-basse-duo', id: 'p-tabl-basse-duo-noir', suffix: 'noir fumé', colors: ['noir'], img: 2 },
  { of: 'p-tabl-bureau', id: 'p-tabl-bureau-noir', suffix: 'lino noir', colors: ['noir', 'bois clair'], img: 4 },

  // Luminaires
  { of: 'p-lumi-halo', id: 'p-lumi-halo-noir', suffix: 'monture noire', colors: ['blanc', 'noir'], materials: ['verre opalin', 'acier'], img: 3 },
  { of: 'p-lumi-champignon', id: 'p-lumi-champignon-creme', suffix: 'crème', colors: ['crème'], img: 4 },
  { of: 'p-lumi-champignon', id: 'p-lumi-champignon-ocre', suffix: 'ocre', colors: ['ocre'], img: 0, priceDelta: 0 },
  { of: 'p-lumi-ligne', id: 'p-lumi-ligne-blanche', suffix: 'blanc', colors: ['blanc'], img: 1 },
  { of: 'p-lumi-nuage', id: 'p-lumi-nuage-rose', suffix: 'rose poudré', colors: ['rose poudré'], img: 2, priceDelta: 10 },

  // Tapis
  { of: 'p-tapi-berbere', id: 'p-tapi-berbere-caramel', suffix: 'losanges caramel', colors: ['écru', 'caramel'], img: 1 },
  { of: 'p-tapi-vague', id: 'p-tapi-vague-terracotta', suffix: 'terracotta', colors: ['terracotta', 'crème'], img: 2 },
  { of: 'p-tapi-couloir', id: 'p-tapi-couloir-sauge', suffix: 'rayures sauge', colors: ['vert sauge', 'écru'], img: 3 },
  { of: 'p-tapi-haute-laine', id: 'p-tapi-haute-laine-perle', suffix: 'gris perle', colors: ['gris perle'], img: 2 },

  // Rangements
  { of: 'p-rang-vague', id: 'p-rang-vague-noyer', suffix: 'noyer', colors: ['noyer'], materials: ['noyer', 'façades cannelées'], img: 3, priceDelta: 150 },
  { of: 'p-rang-etagere', id: 'p-rang-etagere-noire', suffix: 'structure noire', colors: ['bois clair', 'noir'], img: 4 },
  { of: 'p-rang-casier', id: 'p-rang-casier-creme', suffix: 'crème', colors: ['crème'], img: 0 },
  { of: 'p-rang-banc', id: 'p-rang-banc-sauge', suffix: 'lin sauge', colors: ['naturel', 'vert sauge'], img: 1 },

  // Objets décoratifs
  { of: 'p-obje-vase', id: 'p-obje-vase-creme', suffix: 'grès crème', colors: ['crème'], img: 3 },
  { of: 'p-obje-vase', id: 'p-obje-vase-noir', suffix: 'grès noir', colors: ['noir'], img: 4, priceDelta: 10 },
  { of: 'p-obje-miroir', id: 'p-obje-miroir-laiton', suffix: 'cadre laiton', colors: ['laiton'], materials: ['verre', 'laiton'], img: 2, priceDelta: 40 },
  { of: 'p-obje-plaid', id: 'p-obje-plaid-ocre', suffix: 'ocre miel', colors: ['ocre'], img: 0 },
  { of: 'p-obje-affiche', id: 'p-obje-affiche-sauge', suffix: 'tons sauge', colors: ['vert sauge', 'écru'], img: 1 },
];
