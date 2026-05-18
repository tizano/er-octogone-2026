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

export function OptionSelectors({
  product,
  variantId,
  onVariantChange,
}: Props) {
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
    <div className="flex flex-col gap-3">
      {product.options.map((option) => {
        if (option.values.length <= 1) return null;
        const selectId = `${product.id}-${option.name}`;
        return (
          <div key={option.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor={selectId}
                className="font-medium text-[13px] text-[#1c1a1e]"
              >
                Choix {option.name.toLowerCase()}{' '}
                <span className="text-[#4a2278]">*</span>
              </label>
              <span className="text-[11px] text-[#8b8694]">
                {option.values.length} choix
              </span>
            </div>
            <div className="relative">
              <select
                id={selectId}
                className="h-10 w-full appearance-none rounded-md border border-[#d8d2e0] bg-white px-3 pr-9 text-sm text-[#1c1a1e] transition-colors focus:border-[#4a2278] focus:outline-none focus:ring-2 focus:ring-[#4a2278]/20"
                value={selectedOptions[option.name] ?? ''}
                onChange={(e) => handleChange(option.name, e.target.value)}
              >
                <option value="">- Choisir -</option>
                {option.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <svg
                className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-[#6b6573]"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
