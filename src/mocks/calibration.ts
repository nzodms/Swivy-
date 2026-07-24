import { productById } from './products';
import type { Product } from '@/types';

/**
 * Cartes de calibration de l'onboarding : 12 pièces volontairement
 * contrastées (styles, couleurs, prix, audace) pour situer rapidement
 * le profil initial.
 */
const CALIBRATION_IDS: string[] = [
  'p-cana-aria', // minimaliste chaleureux, bouclette
  'p-faut-rotin', // bohème, rotin
  'p-tabl-lune', // organique, travertin
  'p-lumi-arc', // art déco, laiton
  'p-chai-ecole', // scandinave sage
  'p-cana-terra', // terracotta, lin
  'p-lumi-washi', // japandi sculptural
  'p-rang-casier', // industriel
  'p-obje-miroir', // organique audacieux
  'p-tapi-persan', // vintage riche
  'p-faut-bloc', // sculptural contemporain
  'p-lumi-champignon', // vintage accessible
];

export const calibrationProducts: Product[] = CALIBRATION_IDS.map((id) => {
  const product = productById.get(id);
  if (!product) throw new Error(`Produit de calibration introuvable: ${id}`);
  return product;
});
