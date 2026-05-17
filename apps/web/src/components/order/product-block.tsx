import type { ShopifyProduct } from '@er-octogone-2026/api/shopify';

import type { ProductSlot } from '@/lib/order/types';

import { OptionSelectors } from './option-selectors';

type Props = {
  product: ShopifyProduct;
  slots: ProductSlot[];
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onVariantChange: (slotId: string, variantId: string) => void;
};

export function ProductBlock({
  product,
  slots,
  quantity,
  onQuantityChange,
  onVariantChange,
}: Props) {
  const hasOptions =
    product.options.length > 1 || (product.options[0]?.values.length ?? 0) > 1;
  const quantityId = `quantity-${product.id}`;

  return (
    <div className="space-y-4">
      <div className="bg-[#4a2278] text-white font-black uppercase px-4 py-2 rounded-sm text-sm tracking-wider">
        {product.title}
      </div>

      <div className="flex items-center gap-3 px-1">
        <label
          htmlFor={quantityId}
          className="text-sm font-semibold uppercase tracking-wide"
        >
          Quantité :
        </label>
        <input
          id={quantityId}
          type="number"
          min={0}
          className="w-20 rounded border border-purple-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={quantity}
          onChange={(e) =>
            onQuantityChange(Number.parseInt(e.target.value, 10) || 0)
          }
        />
      </div>

      {hasOptions &&
        slots.map((slot, i) => (
          <div
            key={slot.slotId}
            className="rounded-lg border border-purple-200 bg-white/60 p-4"
          >
            {quantity > 1 && (
              <p className="text-xs font-bold uppercase text-purple-700 mb-1">
                {product.title} n°{i + 1}
              </p>
            )}
            <OptionSelectors
              product={product}
              variantId={slot.variantId}
              onVariantChange={(vid) => onVariantChange(slot.slotId, vid)}
            />
          </div>
        ))}
    </div>
  );
}
