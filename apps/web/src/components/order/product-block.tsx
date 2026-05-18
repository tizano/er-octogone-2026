import type { ShopifyProduct } from '@er-octogone-2026/api/shopify';
import { NumberInput } from '@er-octogone-2026/ui/components/number-input';

import type { IncludedAccessory, ProductSlot } from '@/lib/order/types';

import { OptionSelectors } from './option-selectors';

type Props = {
  product: ShopifyProduct;
  bundledProducts: ShopifyProduct[];
  slots: ProductSlot[];
  quantity: number;
  index?: number;
  kicker?: string;
  isPromo?: boolean;
  onQuantityChange: (qty: number) => void;
  onVariantChange: (slotId: string, variantId: string) => void;
  onIncludedChange: (
    slotId: string,
    productId: string,
    variantId: string,
  ) => void;
};

function formatPrice(value?: string) {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return null;
  return `${n.toFixed(2).replace('.', ',')}€`;
}

export function ProductBlock({
  product,
  bundledProducts,
  slots,
  quantity,
  index,
  kicker = 'Le pack',
  isPromo = false,
  onQuantityChange,
  onVariantChange,
  onIncludedChange,
}: Props) {
  const hasOptions =
    product.options.length > 1 || (product.options[0]?.values.length ?? 0) > 1;
  const quantityId = `quantity-${product.id}`;
  const price = formatPrice(product.variants?.[0]?.price);

  return (
    <section className="rounded-2xl border border-[#e7e2ed] bg-white p-6 sm:p-7">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          {typeof index === 'number' && (
            <div className="mb-1 text-[11px] text-[#8b8694] uppercase tracking-[0.12em]">
              {String(index).padStart(2, '0')} - {kicker}
            </div>
          )}
          <h2 className="font-black text-2xl text-[#1c1a1e] uppercase leading-none tracking-wide">
            {product.title}
          </h2>
        </div>
        {price && (
          <div className="flex flex-col items-end rounded-md bg-[#f9f5ff] px-2.5 py-1.5 text-[#4a2278] leading-tight">
            {!isPromo && (
              <span className="text-[9px] uppercase tracking-[0.12em] opacity-70">
                À partir de
              </span>
            )}
            <span className="font-semibold text-sm">{price}</span>
          </div>
        )}
      </div>

      <p className="mb-4 text-[#6b6573] text-sm leading-relaxed">
        Inclus avec votre{' '}
        <strong className="font-semibold text-[#1c1a1e]">Epic Box</strong>:
        <br />
        <strong className="font-semibold text-[#1c1a1e]">
          {bundledProducts.map((p) => p.title).join(' - ')}
        </strong>
      </p>

      <div className="mb-6 flex flex-col gap-1">
        <label
          htmlFor={quantityId}
          className="font-bold text-[13px] text-[#1c1a1e]"
        >
          Quantité
        </label>
        <NumberInput
          id={quantityId}
          value={quantity}
          onValueChange={(value) => onQuantityChange(value ?? 0)}
          min={0}
          max={100}
        />
      </div>

      {slots.length === 0 && (
        <p className="text-[#8b8694] text-sm">
          Augmentez la quantité pour configurer votre Epic Box.
        </p>
      )}

      {slots.length > 0 && (
        <>
          <div className="text-[#8b8694] text-sm mb-2">
            Choisissez vos finitions ci-dessous.
          </div>
          <div className="flex flex-col gap-4">
            {slots.map((slot, i) => (
              <div
                key={slot.slotId}
                className="rounded-lg border border-[#e7e2ed] bg-[#faf7ff] p-4"
              >
                {quantity > 1 && (
                  <p className="mb-3 font-semibold text-[11px] text-[#4a2278] uppercase tracking-[0.12em]">
                    {product.title} n°{i + 1}
                  </p>
                )}

                {hasOptions && (
                  <OptionSelectors
                    product={product}
                    variantId={slot.variantId}
                    onVariantChange={(vid) => onVariantChange(slot.slotId, vid)}
                  />
                )}

                {bundledProducts.length > 0 && (
                  <div
                    className={`flex flex-col gap-3 ${hasOptions ? 'mt-4 border-t border-[#e7e2ed] pt-4' : ''}`}
                  >
                    {bundledProducts.map((acc) => {
                      if (acc.variants.length <= 1) return null;
                      const current = slot.includedAccessories.find(
                        (a) => a.productId === acc.id.toString(),
                      );
                      return (
                        <IncludedAccessorySelect
                          key={acc.id}
                          accessory={acc}
                          slotId={slot.slotId}
                          current={current}
                          onChange={(variantId) =>
                            onIncludedChange(
                              slot.slotId,
                              acc.id.toString(),
                              variantId,
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function IncludedAccessorySelect({
  accessory,
  slotId,
  current,
  onChange,
}: {
  accessory: ShopifyProduct;
  slotId: string;
  current: IncludedAccessory | undefined;
  onChange: (variantId: string) => void;
}) {
  const selectId = `inc-${slotId}-${accessory.id}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={selectId}
          className="font-medium text-[13px] text-[#1c1a1e]"
        >
          {accessory.title}{' '}
          <span className="font-normal text-[#8b8694] text-[11px]">
            (inclus)
          </span>
        </label>
        <span className="text-[11px] text-[#8b8694]">
          {accessory.variants.length} choix
        </span>
      </div>
      <div className="relative">
        <select
          id={selectId}
          value={current?.variantId ?? ''}
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
