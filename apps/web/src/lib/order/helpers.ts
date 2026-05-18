import type {
  ShopifyProduct,
  ShopifyVariant,
} from '@er-octogone-2026/api/shopify';

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from './schemas';
import type { AccessoryExtras, ProductSlot } from './types';

type VariantOptionKey = keyof Pick<
  ShopifyVariant,
  'option1' | 'option2' | 'option3'
>;

function optionKey(index: number): VariantOptionKey {
  return `option${index + 1}` as VariantOptionKey;
}

export function hasMixedVariantPrices(product: ShopifyProduct): boolean {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1;
}

export function parseTagList(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

const PACK_INCLUDES_PREFIX = 'pack-includes-';
const KIND_PREFIX = 'kind-';
const UNIVERSAL_INCLUDED_TAG = 'accessory-event';

// Returns every product that should be auto-bundled (at 0€) into a main product:
// 1. Universal accessory-event products (top/token/skin)
// 2. Pack-specific products matched via `pack-includes-<X>` ↔ `kind-<X>` tags
export function getBundledProducts(
  mainProduct: ShopifyProduct,
  allProducts: ShopifyProduct[],
): ShopifyProduct[] {
  const mainTags = parseTagList(mainProduct.tags);
  const packKinds = mainTags
    .filter((t) => t.startsWith(PACK_INCLUDES_PREFIX))
    .map((t) => t.slice(PACK_INCLUDES_PREFIX.length));

  const universal = allProducts.filter((p) =>
    parseTagList(p.tags).includes(UNIVERSAL_INCLUDED_TAG),
  );

  const packExtras = packKinds.flatMap((kind) => {
    const expectedTag = `${KIND_PREFIX}${kind}`;
    return allProducts.filter((p) =>
      parseTagList(p.tags).includes(expectedTag),
    );
  });

  // Stable order: universal first, then pack extras in tag declaration order
  const seen = new Set<number>();
  const out: ShopifyProduct[] = [];
  for (const p of [...universal, ...packExtras]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export function getDefaultVariantId(product: ShopifyProduct): string {
  if (product.variants.length === 1) return product.variants[0].id.toString();
  const firstValues = product.options.map((o) => o.values[0] ?? '');
  const match = product.variants.find((v) =>
    firstValues.every((val, i) => v[optionKey(i)] === val),
  );
  return match?.id.toString() ?? product.variants[0]?.id.toString() ?? '';
}

export function findVariantFromOptions(
  product: ShopifyProduct,
  selectedOptions: Record<string, string>,
): ShopifyVariant | undefined {
  return product.variants.find((v) =>
    product.options.every((opt, i) => {
      const selected = selectedOptions[opt.name];
      return !selected || v[optionKey(i)] === selected;
    }),
  );
}

export function optionsFromVariantId(
  product: ShopifyProduct,
  variantId: string,
): Record<string, string> {
  const variant = product.variants.find((v) => v.id.toString() === variantId);
  if (!variant) {
    return Object.fromEntries(
      product.options.map((o) => [o.name, o.values[0] ?? '']),
    );
  }
  return Object.fromEntries(
    product.options.map((opt, i) => [
      opt.name,
      variant[optionKey(i)] ?? opt.values[0] ?? '',
    ]),
  );
}

function findVariant(
  products: ShopifyProduct[],
  productId: string,
  variantId: string,
) {
  const p = products.find((x) => x.id.toString() === productId);
  return p?.variants.find((v) => v.id.toString() === variantId);
}

export function calculateSubtotal(
  slots: ProductSlot[],
  extras: AccessoryExtras,
  products: ShopifyProduct[],
): number {
  // Epic Box price only (the 3 included accessories are free per business rule)
  const slotsTotal = slots.reduce((sum, s) => {
    const v = findVariant(products, s.productId, s.variantId);
    return sum + (v ? Number.parseFloat(v.price) : 0);
  }, 0);

  // Standalone accessory units at full price
  const extrasTotal = Object.entries(extras).reduce(
    (sum, [productId, units]) =>
      sum +
      units.reduce((acc, u) => {
        const v = findVariant(products, productId, u.variantId);
        return acc + (v ? Number.parseFloat(v.price) : 0);
      }, 0),
    0,
  );

  return slotsTotal + extrasTotal;
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function calculateTotal(
  slots: ProductSlot[],
  extras: AccessoryExtras,
  products: ShopifyProduct[],
): { subtotal: number; shipping: number; total: number } {
  const subtotal = calculateSubtotal(slots, extras, products);
  const shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

export function isCartValid(
  slots: ProductSlot[],
  extras: AccessoryExtras,
): boolean {
  const hasExtras = Object.values(extras).some((units) => units.length > 0);
  if (slots.length === 0 && !hasExtras) return false;

  for (const slot of slots) {
    if (!slot.variantId) return false;
    for (const inc of slot.includedAccessories) {
      if (!inc.variantId) return false;
    }
  }
  for (const units of Object.values(extras)) {
    for (const u of units) {
      if (!u.variantId) return false;
    }
  }
  return true;
}
