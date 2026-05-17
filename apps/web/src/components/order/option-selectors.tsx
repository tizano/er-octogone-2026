import type { ShopifyProduct } from '@er-octogone-2026/api/shopify';
import { useState } from 'react';

import {
  findVariantFromOptions,
  optionsFromVariantId,
} from '@/lib/order/helpers';

type Props = {
  product: ShopifyProduct;
  variantId: string;
  onVariantChange: (variantId: string) => void;
};

export function OptionSelectors({ product, variantId, onVariantChange }: Props) {
  const multiOption =
    product.options.length > 1 || (product.options[0]?.values.length ?? 0) > 1;
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => optionsFromVariantId(product, variantId));

  if (!multiOption) return null;

  function handleChange(optionName: string, value: string) {
    const next = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(next);
    const variant = findVariantFromOptions(product, next);
    if (variant) onVariantChange(variant.id.toString());
  }

  return (
    <div className="space-y-3 mt-3">
      {product.options.map((option) => {
        if (option.values.length <= 1) return null;
        return (
          <div key={option.name}>
            <label
              className="mb-1 block text-sm font-semibold uppercase tracking-wide"
              htmlFor={option.name}
            >
              Choix {option.name.toLowerCase()}
            </label>
            <select
              id={option.name}
              className="w-full rounded border border-purple-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedOptions[option.name] ?? ''}
              onChange={(e) => handleChange(option.name, e.target.value)}
            >
              <option value="">— Choisir —</option>
              {option.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
