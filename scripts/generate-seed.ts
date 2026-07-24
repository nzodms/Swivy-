/**
 * Génère supabase/seed.sql depuis le catalogue de démonstration TypeScript.
 * Source de vérité unique : src/mocks — le SQL n'est jamais édité à la main.
 *
 * Usage : npx tsx scripts/generate-seed.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { merchants } from '../src/mocks/merchants';
import { products } from '../src/mocks/products';
import {
  CATEGORY_LABELS,
  ROOM_LABELS,
  STYLE_LABELS,
  categorySlugSchema,
  priceBandOf,
  type Product,
} from '../src/types';

const OUT_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed.sql');

function sql(value: string | number | boolean | null): string {
  if (value === null) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${value.replace(/'/g, "''")}'`;
}

interface AttributeValueRow {
  id: string;
  attributeId: string;
  value: string;
  label: string;
}

const ATTRIBUTES: { id: string; label: string }[] = [
  { id: 'style', label: 'Style' },
  { id: 'color', label: 'Couleur' },
  { id: 'material', label: 'Matière' },
  { id: 'shape', label: 'Forme' },
  { id: 'room', label: 'Pièce' },
  { id: 'price_band', label: 'Gamme de prix' },
  { id: 'badge', label: 'Badge' },
];

function collectAttributeValues(catalog: Product[]): Map<string, AttributeValueRow> {
  const rows = new Map<string, AttributeValueRow>();
  const add = (attributeId: string, value: string, label: string) => {
    const id = `${attributeId}:${value}`;
    if (!rows.has(id)) rows.set(id, { id, attributeId, value, label });
  };
  for (const product of catalog) {
    for (const style of product.styles) add('style', style, STYLE_LABELS[style]);
    for (const color of product.colors) add('color', color, color);
    for (const material of product.materials) add('material', material, material);
    for (const shape of product.shapes) add('shape', shape, shape);
    for (const room of product.rooms) add('room', room, ROOM_LABELS[room]);
    for (const badge of product.badges) add('badge', badge, badge);
    const band = priceBandOf(product.price);
    add('price_band', band, band);
  }
  return rows;
}

function productAttributeValueIds(product: Product): string[] {
  return [
    ...product.styles.map((style) => `style:${style}`),
    ...product.colors.map((color) => `color:${color}`),
    ...product.materials.map((material) => `material:${material}`),
    ...product.shapes.map((shape) => `shape:${shape}`),
    ...product.rooms.map((room) => `room:${room}`),
    ...product.badges.map((badge) => `badge:${badge}`),
    `price_band:${priceBandOf(product.price)}`,
  ];
}

function generate(): string {
  const lines: string[] = [
    '-- Swivy — seed de démonstration.',
    '-- Fichier GÉNÉRÉ par scripts/generate-seed.ts : ne pas éditer à la main.',
    `-- ${products.length} produits, ${merchants.length} marchands.`,
    '',
    'begin;',
    '',
  ];

  lines.push('-- Marchands');
  for (const merchant of merchants) {
    lines.push(
      `insert into public.merchants (id, name, domain, shipping_info) values (${sql(merchant.id)}, ${sql(merchant.name)}, ${sql(merchant.domain)}, ${sql(merchant.shippingInfo ?? null)});`,
    );
  }

  lines.push('', '-- Catégories');
  for (const slug of categorySlugSchema.options) {
    lines.push(
      `insert into public.categories (id, label, universe) values (${sql(slug)}, ${sql(CATEGORY_LABELS[slug])}, 'decoration');`,
    );
  }

  lines.push('', '-- Attributs');
  for (const attribute of ATTRIBUTES) {
    lines.push(
      `insert into public.attributes (id, label) values (${sql(attribute.id)}, ${sql(attribute.label)});`,
    );
  }

  lines.push('', '-- Valeurs d’attributs');
  const attributeValues = collectAttributeValues(products);
  for (const row of attributeValues.values()) {
    lines.push(
      `insert into public.attribute_values (id, attribute_id, value, label) values (${sql(row.id)}, ${sql(row.attributeId)}, ${sql(row.value)}, ${sql(row.label)});`,
    );
  }

  lines.push('', '-- Produits');
  for (const product of products) {
    lines.push(
      `insert into public.products (id, name, brand, price, previous_price, currency, category_id, description, dimensions, merchant_id, url, in_stock, popularity, boldness, created_at) values (` +
        [
          sql(product.id),
          sql(product.name),
          sql(product.brand),
          product.price,
          product.previousPrice ?? 'null',
          sql(product.currency),
          sql(product.category),
          sql(product.description),
          sql(product.dimensions),
          sql(product.merchantId),
          sql(product.url),
          sql(product.inStock),
          product.popularity,
          product.boldness,
          sql(product.createdAt),
        ].join(', ') +
        ');',
    );
    product.images.forEach((url, position) => {
      lines.push(
        `insert into public.product_images (product_id, url, position) values (${sql(product.id)}, ${sql(url)}, ${position});`,
      );
    });
    for (const attributeValueId of productAttributeValueIds(product)) {
      lines.push(
        `insert into public.product_attribute_values (product_id, attribute_value_id) values (${sql(product.id)}, ${sql(attributeValueId)});`,
      );
    }
  }

  lines.push('', 'commit;', '');
  return lines.join('\n');
}

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, generate(), 'utf8');
process.stdout.write(`seed.sql généré : ${products.length} produits\n`);
