import { z } from 'zod';

import { productSchema } from '@/types';

/**
 * Pipeline d'import de catalogues — types et contrats uniquement.
 * Aucune implémentation (Gemini, Playwright…) n'est branchée ici et
 * rien de ce module n'est importé par les composants mobiles.
 *
 * Flux prévu : ProductSource → RawProduct → NormalizedProduct
 * → EnrichedProduct → catalogue (products), tracé par ProductImportJob.
 */

/** Source d'approvisionnement en produits. */
export const productSourceSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  /** Type de connecteur : flux marchand, scraping, API partenaire, saisie. */
  kind: z.enum(['feed', 'scrape', 'api', 'manual']),
  /** URL racine ou endpoint de la source. */
  url: z.string().url(),
  /** Univers cible ("decoration", "mode", "sneakers"…). */
  universe: z.string(),
  enabled: z.boolean(),
});
export type ProductSource = z.infer<typeof productSourceSchema>;

/** Preuve de provenance conservée pour chaque produit importé. */
export const productSourceEvidenceSchema = z.object({
  sourceId: z.string(),
  /** URL exacte de la page produit d'origine. */
  sourceUrl: z.string().url(),
  merchantId: z.string(),
  /** Date de récupération (ISO 8601). */
  fetchedAt: z.string(),
  /** Prix observé chez le marchand au moment de la récupération. */
  sourcePrice: z.number().positive(),
  sourceCurrency: z.string(),
  /** URL de l'image d'origine (avant re-hébergement éventuel). */
  sourceImageUrl: z.string().url(),
});
export type ProductSourceEvidence = z.infer<typeof productSourceEvidenceSchema>;

/**
 * Produit brut, tel que récupéré — aucune garantie de structure.
 * Le champ `payload` conserve les données d'origine intactes.
 */
export const rawProductSchema = z.object({
  id: z.string(),
  evidence: productSourceEvidenceSchema,
  /** Données brutes non transformées (HTML extrait, JSON de flux…). */
  payload: z.record(z.unknown()),
});
export type RawProduct = z.infer<typeof rawProductSchema>;

/** Statut de validation d'un produit dans le pipeline. */
export const productValidationStatusSchema = z.enum([
  'pending', // récupéré, pas encore normalisé
  'normalized', // structuré, en attente d'enrichissement
  'enriched', // attributs déduits, en attente de revue
  'approved', // publiable dans le catalogue
  'rejected', // écarté (qualité, doublon, hors univers)
]);
export type ProductValidationStatus = z.infer<typeof productValidationStatusSchema>;

/**
 * Produit normalisé : champs du catalogue extraits mécaniquement
 * (nom, prix, images), sans interprétation stylistique.
 */
export const normalizedProductSchema = z.object({
  id: z.string(),
  rawProductId: z.string(),
  evidence: productSourceEvidenceSchema,
  status: productValidationStatusSchema,
  name: z.string(),
  brand: z.string().optional(),
  price: z.number().positive(),
  currency: z.string(),
  images: z.array(z.string().url()),
  categoryHint: z.string().optional(),
  description: z.string().optional(),
  dimensions: z.string().optional(),
});
export type NormalizedProduct = z.infer<typeof normalizedProductSchema>;

/**
 * Produit enrichi : attributs stylistiques déduits (styles, couleurs,
 * matières, formes, audace…) avec un niveau de confiance par le pipeline
 * d'enrichissement (règles ou LLM, plus tard).
 */
export const enrichedProductSchema = z.object({
  id: z.string(),
  normalizedProductId: z.string(),
  evidence: productSourceEvidenceSchema,
  status: productValidationStatusSchema,
  /** Produit final candidat, au format du catalogue. */
  candidate: productSchema,
  /** Confiance globale de l'enrichissement, 0 → 1. */
  confidence: z.number().min(0).max(1),
  /** Confiance par attribut déduit (ex. "style": 0.82). */
  attributeConfidence: z.record(z.number().min(0).max(1)),
});
export type EnrichedProduct = z.infer<typeof enrichedProductSchema>;

/** Exécution d'un import : traçabilité et reprise sur erreur. */
export const productImportJobSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  status: z.enum(['running', 'succeeded', 'failed', 'partial']),
  counts: z.object({
    fetched: z.number().int().nonnegative(),
    normalized: z.number().int().nonnegative(),
    enriched: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
  }),
  error: z.string().optional(),
});
export type ProductImportJob = z.infer<typeof productImportJobSchema>;
