import type { Merchant } from '@/types';

export const merchants: Merchant[] = [
  {
    id: 'm-decantik',
    name: 'Decantik',
    domain: 'decantik.fr',
    shippingInfo: 'Livraison 5 à 8 jours ouvrés',
  },
  {
    id: 'm-habitatelier',
    name: 'Habitatelier',
    domain: 'habitatelier.com',
    shippingInfo: 'Livraison offerte dès 150 €',
  },
  {
    id: 'm-nordal',
    name: 'Nordal Maison',
    domain: 'nordal-maison.fr',
    shippingInfo: 'Expédié sous 48 h',
  },
  {
    id: 'm-fabrique',
    name: 'La Fabrique Déco',
    domain: 'lafabriquedeco.fr',
    shippingInfo: 'Livraison sur rendez-vous pour les grandes pièces',
  },
  {
    id: 'm-interieur',
    name: 'Intérieur & Co',
    domain: 'interieur-co.com',
    shippingInfo: 'Retrait showroom Paris 11e possible',
  },
];

export function merchantById(id: string): Merchant | undefined {
  return merchants.find((m) => m.id === id);
}
