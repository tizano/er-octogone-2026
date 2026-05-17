import type {
  ShopifyProduct,
  ShopifyVariant,
} from '@er-octogone-2026/api/shopify';

import type { AccessoryState, ProductSlot } from './types';

type VariantOptionKey = keyof Pick<
  ShopifyVariant,
  'option1' | 'option2' | 'option3'
>;

function optionKey(index: number): VariantOptionKey {
  return `option${index + 1}` as VariantOptionKey;
}

export function parseTagList(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
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

export function calculateTotal(
  slots: ProductSlot[],
  accessories: AccessoryState[],
  products: ShopifyProduct[],
): number {
  const findVariant = (productId: string, variantId: string) => {
    const p = products.find((x) => x.id.toString() === productId);
    return p?.variants.find((v) => v.id.toString() === variantId);
  };

  let total = slots.reduce((sum, s) => {
    const v = findVariant(s.productId, s.variantId);
    return sum + (v ? Number.parseFloat(v.price) : 0);
  }, 0);

  for (const acc of accessories) {
    if (acc.enabled && acc.variantId) {
      const v = findVariant(acc.productId, acc.variantId);
      total += v ? Number.parseFloat(v.price) : 0;
    }
  }

  return total;
}
