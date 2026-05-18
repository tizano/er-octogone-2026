import type { ShopifyProduct } from '@er-octogone-2026/api/shopify';
import { NumberInput } from '@er-octogone-2026/ui/components/number-input';

import { hasMixedVariantPrices } from '@/lib/order/helpers';
import type { AccessoryExtras, AccessoryUnit } from '@/lib/order/types';

type Props = {
  accessoryProducts: ShopifyProduct[];
  extras: AccessoryExtras;
  index?: number;
  onQuantityChange: (productId: string, qty: number) => void;
  onUnitVariantChange: (
    productId: string,
    unitId: string,
    variantId: string,
  ) => void;
};

function formatPrice(value?: string) {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return null;
  return `${n.toFixed(2).replace('.', ',')}€`;
}

export function AccessoriesSection({
  accessoryProducts,
  extras,
  index,
  onQuantityChange,
  onUnitVariantChange,
}: Props) {
  if (accessoryProducts.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#e7e2ed] bg-white p-6 sm:p-7">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          {typeof index === 'number' && (
            <div className="mb-1 text-[11px] text-[#8b8694] uppercase tracking-[0.12em]">
              {String(index).padStart(2, '0')} - En plus
            </div>
          )}
          <h2 className="font-black text-2xl text-[#1c1a1e] uppercase leading-none tracking-wide">
            Accessoires supplémentaires
          </h2>
        </div>
        <div className="rounded-md bg-[#f9f5ff] px-2.5 py-1.5 font-semibold text-[#4a2278] text-[11px] uppercase tracking-[0.12em]">
          Optionnel
        </div>
      </div>
      <p className="mb-4 text-[#6b6573] text-sm leading-relaxed">
        Ajoutez des accessoires à l'unité, en plus de celles incluses dans votre
        Epic Box.
      </p>

      <div className="flex flex-col">
        {accessoryProducts.map((acc, i) => {
          const productId = acc.id.toString();
          const units = extras[productId] ?? [];
          const price = formatPrice(acc.variants?.[0]?.price);
          return (
            <div
              key={acc.id}
              className={`flex flex-col gap-3 py-4 ${i > 0 ? 'border-[#e7e2ed] border-t' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1c1a1e] text-[15px]">
                    {acc.title}
                  </span>
                  {price && (
                    <span className="text-[#6b6573] text-[13px] tabular-nums">
                      {hasMixedVariantPrices(acc) && 'À partir de '}
                      {price} <span className="text-[#8b8694]">/ unité</span>
                    </span>
                  )}
                </div>
                <NumberInput
                  id={`extra-qty-${acc.id}`}
                  value={units.length}
                  onValueChange={(v) => onQuantityChange(productId, v ?? 0)}
                  min={0}
                  max={50}
                />
              </div>

              {units.length > 0 && acc.variants.length > 1 && (
                <div className="flex flex-col gap-2">
                  {units.map((unit, idx) => (
                    <UnitSelect
                      key={unit.unitId}
                      accessory={acc}
                      unit={unit}
                      index={units.length > 1 ? idx + 1 : undefined}
                      onChange={(variantId) =>
                        onUnitVariantChange(productId, unit.unitId, variantId)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UnitSelect({
  accessory,
  unit,
  index,
  onChange,
}: {
  accessory: ShopifyProduct;
  unit: AccessoryUnit;
  index?: number;
  onChange: (variantId: string) => void;
}) {
  const selectId = `extra-${unit.unitId}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="font-medium text-[12px] text-[#6b6573]"
      >
        {accessory.title}
        {typeof index === 'number' ? ` n°${index}` : ''}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={unit.variantId}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-[#d8d2e0] bg-white px-3 pr-9 text-sm text-[#1c1a1e] transition-colors focus:border-[#4a2278] focus:outline-none focus:ring-2 focus:ring-[#4a2278]/20"
        >
          <option value="">- Choisir -</option>
          {accessory.variants.map((v) => (
            <option key={v.id} value={v.id.toString()}>
              {v.title}
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
}
