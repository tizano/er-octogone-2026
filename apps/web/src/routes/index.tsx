import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CustomerSection } from '@/components/order/customer-section';
import { OrderConfirmation } from '@/components/order/order-confirmation';
import { OrderHero } from '@/components/order/order-hero';
import { ProductBlock } from '@/components/order/product-block';
import {
  calculateTotal,
  getDefaultVariantId,
  parseTagList,
} from '@/lib/order/helpers';
import {
  type CustomerForm,
  customerSchema,
  emptyAddress,
} from '@/lib/order/schemas';
import type { AccessoryState, ProductSlot } from '@/lib/order/types';
import { useTRPC } from '@/utils/trpc';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.trpc.shopify.products.queryOptions(),
    ),
  component: OrderPage,
});

function OrderPage() {
  const trpc = useTRPC();
  const { data: products = [] } = useQuery(
    trpc.shopify.products.queryOptions(),
  );

  const [phase, setPhase] = useState<'form' | 'confirmed'>('form');
  const [orderName, setOrderName] = useState('');

  const mainProducts = products.filter((p) =>
    parseTagList(p.tags).includes('product-event'),
  );
  const accessoryProducts = products.filter((p) =>
    parseTagList(p.tags).includes('accessory'),
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [slots, setSlots] = useState<ProductSlot[]>([]);
  const [accessories, setAccessories] = useState<AccessoryState[]>([]);

  // Sync accessories defaults once products are loaded
  const [initialised, setInitialised] = useState(false);
  if (products.length > 0 && !initialised) {
    setInitialised(true);
    setAccessories(
      accessoryProducts.map((p) => ({
        productId: p.id.toString(),
        enabled: false,
        variantId: getDefaultVariantId(p),
      })),
    );
  }

  function handleQuantityChange(productId: string, newQty: number) {
    if (newQty < 0) return;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));

    const product = mainProducts.find((p) => p.id.toString() === productId);
    const defaultVariantId = product ? getDefaultVariantId(product) : '';

    setSlots((prev) => {
      const productSlots = prev.filter((s) => s.productId === productId);
      const otherSlots = prev.filter((s) => s.productId !== productId);
      const newSlots: ProductSlot[] = Array.from({ length: newQty }, (_, i) => {
        return (
          productSlots[i] ?? {
            slotId: `${productId}-${Date.now()}-${i}`,
            productId,
            variantId: defaultVariantId,
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

  const total = calculateTotal(slots, accessories, products);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
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
      },
      onError: (err) => {
        toast.error(`Erreur : ${err.message}`);
      },
    }),
  );

  const onSubmit = handleSubmit(async (customer) => {
    if (slots.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }

    const unselected = slots.filter((s) => !s.variantId);
    if (unselected.length > 0) {
      toast.error('Veuillez sélectionner tous les variants de produits');
      return;
    }

    const badAccessory = accessories.find((a) => a.enabled && !a.variantId);
    if (badAccessory) {
      toast.error(
        'Veuillez sélectionner le variant de chaque accessoire activé',
      );
      return;
    }

    const billing = customer.billingSameAsShipping
      ? customer.shipping
      : customer.billing;

    await createOrder.mutateAsync({
      mainSlots: slots.map((s) => ({
        productId: s.productId,
        variantId: s.variantId,
      })),
      accessories: accessories.map((a) => ({
        productId: a.productId,
        variantId: a.variantId,
        enabled: a.enabled,
      })),
      customer: {
        shipping: customer.shipping,
        billing,
        email: customer.email,
        phone: customer.phone,
      },
    });
  });

  if (phase === 'confirmed') return <OrderConfirmation orderName={orderName} />;

  return (
    <div
      className="min-h-screen px-4 py-10 max-w-lg mx-auto"
      style={{ background: '#f0eef8' }}
    >
      <OrderHero />

      <form onSubmit={onSubmit} className="space-y-8">
        {mainProducts.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            Aucun produit principal trouvé (tag "product-event" requis sur
            Shopify).
          </p>
        )}

        {mainProducts.map((product) => {
          const qty = quantities[product.id.toString()] ?? 0;
          const productSlots = slots.filter(
            (s) => s.productId === product.id.toString(),
          );
          return (
            <ProductBlock
              key={product.id}
              product={product}
              slots={productSlots}
              quantity={qty}
              onQuantityChange={(q) =>
                handleQuantityChange(product.id.toString(), q)
              }
              onVariantChange={handleSlotVariantChange}
            />
          );
        })}

        <div className="bg-[#4a2278] text-white font-black text-center py-4 rounded-sm text-xl tracking-wide">
          TOTAL : {total.toFixed(2)}€
        </div>

        <CustomerSection
          register={register}
          control={control}
          errors={errors}
        />

        <button
          type="submit"
          disabled={createOrder.isPending}
          className="w-full bg-[#4a2278] hover:bg-[#3a1a60] disabled:opacity-60 text-white font-black uppercase py-4 rounded-sm text-base tracking-widest transition-colors"
        >
          {createOrder.isPending
            ? 'Enregistrement…'
            : 'Enregistrer ma commande'}
        </button>
      </form>
    </div>
  );
}
