import type { ShopifyProduct } from '@er-octogone-2026/api/shopify';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AccessoriesSection } from '@/components/order/accessories-section';
import { CustomerSection } from '@/components/order/customer-section';
import { OrderConfirmation } from '@/components/order/order-confirmation';
import { OrderHero } from '@/components/order/order-hero';
import { ProductBlock } from '@/components/order/product-block';
import {
  calculateTotal,
  getBundledProducts,
  getDefaultVariantId,
  isCartValid,
  parseTagList,
} from '@/lib/order/helpers';
import {
  type CustomerForm,
  customerSchema,
  emptyAddress,
} from '@/lib/order/schemas';
import type {
  AccessoryExtras,
  AccessoryUnit,
  IncludedAccessory,
  ProductSlot,
} from '@/lib/order/types';
import { useTRPC } from '@/utils/trpc';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.trpc.shopify.products.queryOptions(),
    ),
  component: OrderPage,
});

function buildIncludedDefaults(bundled: ShopifyProduct[]): IncludedAccessory[] {
  return bundled.map((p) => ({
    productId: p.id.toString(),
    variantId: getDefaultVariantId(p),
  }));
}

function isPromoProduct(product: ShopifyProduct): boolean {
  return parseTagList(product.tags).some((t) => t.startsWith('pack-includes-'));
}

function OrderPage() {
  const trpc = useTRPC();
  const { data: products = [] } = useQuery(
    trpc.shopify.products.queryOptions(),
  );

  const [phase, setPhase] = useState<'form' | 'confirmed'>('form');
  const [orderName, setOrderName] = useState('');

  const mainProducts = useMemo(
    () =>
      products.filter((p) => parseTagList(p.tags).includes('product-event')),
    [products],
  );
  const standaloneAccessories = useMemo(
    () =>
      products.filter((p) => {
        const tags = parseTagList(p.tags);
        return (
          tags.includes('accessory-event') || tags.includes('accessory-extra')
        );
      }),
    [products],
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [slots, setSlots] = useState<ProductSlot[]>([]);
  const [extras, setExtras] = useState<AccessoryExtras>({});

  function handleQuantityChange(productId: string, newQty: number) {
    if (newQty < 0) return;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));

    const product = mainProducts.find((p) => p.id.toString() === productId);
    const defaultVariantId = product ? getDefaultVariantId(product) : '';
    const bundled = product ? getBundledProducts(product, products) : [];

    setSlots((prev) => {
      const productSlots = prev.filter((s) => s.productId === productId);
      const otherSlots = prev.filter((s) => s.productId !== productId);
      const newSlots: ProductSlot[] = Array.from({ length: newQty }, (_, i) => {
        return (
          productSlots[i] ?? {
            slotId: `${productId}-${Date.now()}-${i}`,
            productId,
            variantId: defaultVariantId,
            includedAccessories: buildIncludedDefaults(bundled),
          }
        );
      });
      return [...otherSlots, ...newSlots];
    });
  }

  function handleSlotVariantChange(slotId: string, variantId: string) {
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, variantId } : s)),
    );
  }

  function handleIncludedChange(
    slotId: string,
    productId: string,
    variantId: string,
  ) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.slotId !== slotId) return s;
        const exists = s.includedAccessories.some(
          (a) => a.productId === productId,
        );
        const next = exists
          ? s.includedAccessories.map((a) =>
              a.productId === productId ? { ...a, variantId } : a,
            )
          : [...s.includedAccessories, { productId, variantId }];
        return { ...s, includedAccessories: next };
      }),
    );
  }

  function handleExtraQtyChange(productId: string, qty: number) {
    if (qty < 0) return;
    const product = standaloneAccessories.find(
      (p) => p.id.toString() === productId,
    );
    const defaultVariantId = product ? getDefaultVariantId(product) : '';
    setExtras((prev) => {
      const existing = prev[productId] ?? [];
      const newUnits: AccessoryUnit[] = Array.from({ length: qty }, (_, i) => {
        return (
          existing[i] ?? {
            unitId: `${productId}-extra-${Date.now()}-${i}`,
            variantId: defaultVariantId,
          }
        );
      });
      return { ...prev, [productId]: newUnits };
    });
  }

  function handleExtraUnitChange(
    productId: string,
    unitId: string,
    variantId: string,
  ) {
    setExtras((prev) => {
      const units = prev[productId] ?? [];
      return {
        ...prev,
        [productId]: units.map((u) =>
          u.unitId === unitId ? { ...u, variantId } : u,
        ),
      };
    });
  }

  const { subtotal, shipping, total } = useMemo(
    () => calculateTotal(slots, extras, products),
    [slots, extras, products],
  );
  const cartValid = isCartValid(slots, extras);
  const itemCount =
    slots.length + Object.values(extras).reduce((sum, u) => sum + u.length, 0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      shipping: emptyAddress,
      billing: emptyAddress,
      billingSameAsShipping: true,
      email: '',
      phone: '',
    },
  });

  const createOrder = useMutation(
    trpc.shopify.createOrder.mutationOptions({
      onSuccess: (data) => {
        setOrderName(data.orderName);
        setPhase('confirmed');
        toast.success(`Commande ${data.orderName} enregistrée 🎉`);
      },
      onError: (err) => {
        toast.error(`Erreur : ${err.message}`);
      },
    }),
  );

  const onSubmit = handleSubmit(
    async (customer) => {
      if (!cartValid) {
        toast.error('Veuillez compléter votre commande');
        return;
      }
      const billing = customer.billingSameAsShipping
        ? customer.shipping
        : customer.billing;

      await createOrder.mutateAsync({
        slots: slots.map((s) => ({
          productId: s.productId,
          variantId: s.variantId,
          includedAccessories: s.includedAccessories,
        })),
        extras: Object.entries(extras).flatMap(([productId, units]) =>
          units.map((u) => ({ productId, variantId: u.variantId })),
        ),
        customer: {
          shipping: customer.shipping,
          billing,
          email: customer.email,
          phone: customer.phone,
        },
      });
    },
    () => {
      toast.error('Veuillez vérifier les champs en rouge');
    },
  );

  if (phase === 'confirmed') return <OrderConfirmation orderName={orderName} />;

  const submitDisabled = !cartValid || !isValid || createOrder.isPending;

  return (
    <div className="flex min-h-screen flex-col bg-[#f0eef8]">
      <main className="mx-auto w-full max-w-xl px-5 py-8 sm:px-6 sm:py-10">
        <OrderHero />

        <form onSubmit={onSubmit} className="flex flex-col gap-8">
          {mainProducts.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              Aucun produit principal trouvé (tag "product-event" requis sur
              Shopify).
            </p>
          )}

          {(() => {
            const standardProducts = mainProducts.filter(
              (p) => !isPromoProduct(p),
            );
            const promoProducts = mainProducts.filter(isPromoProduct);

            const renderCard = (
              product: ShopifyProduct,
              cardIndex: number | undefined,
            ) => {
              const qty = quantities[product.id.toString()] ?? 0;
              const productSlots = slots.filter(
                (s) => s.productId === product.id.toString(),
              );
              const bundled = getBundledProducts(product, products);
              const promo = isPromoProduct(product);
              return (
                <ProductBlock
                  key={product.id}
                  product={product}
                  bundledProducts={bundled}
                  slots={productSlots}
                  quantity={qty}
                  index={cardIndex}
                  kicker={promo ? 'En promo' : 'Le pack'}
                  isPromo={promo}
                  onQuantityChange={(q) =>
                    handleQuantityChange(product.id.toString(), q)
                  }
                  onVariantChange={handleSlotVariantChange}
                  onIncludedChange={handleIncludedChange}
                />
              );
            };

            const nodes: React.ReactNode[] = [];
            let section = 0;

            for (const product of standardProducts) {
              section += 1;
              nodes.push(renderCard(product, section));
            }

            if (promoProducts.length > 0) {
              section += 1;
              const promoSection = section;
              nodes.push(
                <div
                  key="promo-group"
                  className="flex flex-col gap-6 rounded-2xl border border-[#4a2278]/25 bg-[#4a2278]/[0.06] p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#4a2278] uppercase tracking-[0.12em]">
                      {String(promoSection).padStart(2, '0')} - En promo 🔥
                    </span>
                    <span className="h-px flex-1 bg-[#4a2278]/20" />
                  </div>
                  {promoProducts.map((p) => renderCard(p, undefined))}
                </div>,
              );
            }

            return nodes;
          })()}

          <AccessoriesSection
            accessoryProducts={standaloneAccessories}
            extras={extras}
            index={
              mainProducts.filter((p) => !isPromoProduct(p)).length +
              (mainProducts.some(isPromoProduct) ? 1 : 0) +
              1
            }
            onQuantityChange={handleExtraQtyChange}
            onUnitVariantChange={handleExtraUnitChange}
          />

          <CustomerSection
            register={register}
            control={control}
            errors={errors}
          />

          <section className="relative overflow-hidden rounded-2xl bg-[#1c1a1e] p-7 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(123,48,176,0.25),transparent_60%)]" />

            <div className="relative flex flex-col gap-1.5 text-[13px] text-white/70">
              <div className="flex justify-between tabular-nums">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2).replace('.', ',')}€</span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span>Livraison</span>
                <span>
                  {shipping === 0
                    ? 'Offerte'
                    : `${shipping.toFixed(2).replace('.', ',')}€`}
                </span>
              </div>
            </div>

            <div className="relative my-3 h-px bg-white/10" />

            <div className="relative flex items-end justify-between">
              <div>
                <div className="font-black text-2xl uppercase leading-none tracking-wide">
                  Total
                </div>
                <div className="mt-1 text-[12px] text-white/50 tracking-wide">
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </div>
              </div>
              <div className="font-black text-4xl tabular-nums leading-none">
                {total.toFixed(2).replace('.', ',')}€
              </div>
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className="relative mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#4a2278] py-3.5 font-semibold text-[15px] text-white tracking-wide transition-colors hover:bg-[#5a2e8d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createOrder.isPending ? 'En cours…' : 'Enregistrer ma commande'}
              {!createOrder.isPending && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <p className="relative mt-4 text-center text-[12px] text-white/60 leading-relaxed">
              En cliquant, vous réservez votre commande. Pour la valider, passez
              payer au stand Epic Rolls à OctoGônes et demandez votre reçu par
              mail ou SMS.
            </p>
          </section>
        </form>
      </main>
    </div>
  );
}
