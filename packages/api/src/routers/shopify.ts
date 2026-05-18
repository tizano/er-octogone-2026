import { z } from 'zod';
import { publicProcedure, router } from '../index';
import {
  completeDraftOrder,
  createDraftOrder,
  getProducts,
  type LineItem,
} from '../shopify';

const FREE_SHIPPING_THRESHOLD = 85;
const SHIPPING_FEE = 4.9;
const UNIVERSAL_INCLUDED_TAG = 'accessory-event';
const STANDALONE_EXTRA_TAG = 'accessory-extra';
const MAIN_PRODUCT_TAG = 'product-event';
const PACK_INCLUDES_PREFIX = 'pack-includes-';
const KIND_PREFIX = 'kind-';

const includedAccessorySchema = z.object({
  productId: z.string(),
  variantId: z.string().min(1, 'Variant accessoire requis'),
});

const slotSchema = z.object({
  productId: z.string(),
  variantId: z.string().min(1, 'Variant requis'),
  includedAccessories: z.array(includedAccessorySchema),
});

const extraUnitSchema = z.object({
  productId: z.string(),
  variantId: z.string().min(1, 'Variant accessoire requis'),
});

const phoneSchema = z
  .string()
  .min(1, 'Téléphone requis')
  .refine((val) => {
    const cleaned = val.replace(/[\s.\-()]/g, '');
    return /^\+?\d{9,15}$/.test(cleaned);
  }, 'Téléphone invalide');

const addressSchema = z.object({
  lastName: z.string().min(1, 'Nom requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  address1: z.string().min(1, 'Adresse requise'),
  zip: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  city: z.string().min(1, 'Ville requise'),
});

const customerSchema = z.object({
  shipping: addressSchema,
  billing: addressSchema,
  email: z.string().email('Email invalide'),
  phone: phoneSchema,
});

const createOrderSchema = z
  .object({
    slots: z.array(slotSchema),
    extras: z.array(extraUnitSchema),
    customer: customerSchema,
  })
  .superRefine((data, ctx) => {
    if (data.slots.length === 0 && data.extras.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Sélectionnez au moins un produit ou un accessoire',
        path: ['slots'],
      });
    }
  });

function parseTags(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export const shopifyRouter = router({
  products: publicProcedure.query(async () => {
    return await getProducts();
  }),

  createOrder: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input }) => {
      // Fetch products server-side - never trust client prices
      const products = await getProducts();

      const findProduct = (productId: string) =>
        products.find((p) => p.id.toString() === productId);

      const findVariantPrice = (
        productId: string,
        variantId: string,
      ): number => {
        const p = findProduct(productId);
        const v = p?.variants.find((x) => x.id.toString() === variantId);
        return v ? Number.parseFloat(v.price) : 0;
      };

      // Verify each slot product carries the main tag
      for (const slot of input.slots) {
        const p = findProduct(slot.productId);
        if (!p) throw new Error(`Produit inconnu: ${slot.productId}`);
        if (!parseTags(p.tags).includes(MAIN_PRODUCT_TAG)) {
          throw new Error(`Produit invalide pour cet événement: ${p.title}`);
        }
      }

      // Universal accessories (top/token/skin) - always allowed in any slot
      const universalIds = new Set(
        products
          .filter((p) => parseTags(p.tags).includes(UNIVERSAL_INCLUDED_TAG))
          .map((p) => p.id.toString()),
      );

      // Resolve per-slot allowed bundled product ids by reading the main
      // product's pack-includes-<kind> tags and matching them to products
      // tagged kind-<kind>.
      function allowedBundledIdsFor(mainProductId: string): Set<string> {
        const main = findProduct(mainProductId);
        if (!main) return new Set();
        const ids = new Set<string>(universalIds);
        const kinds = parseTags(main.tags)
          .filter((t) => t.startsWith(PACK_INCLUDES_PREFIX))
          .map((t) => t.slice(PACK_INCLUDES_PREFIX.length));
        for (const kind of kinds) {
          const expected = `${KIND_PREFIX}${kind}`;
          for (const p of products) {
            if (parseTags(p.tags).includes(expected)) {
              ids.add(p.id.toString());
            }
          }
        }
        return ids;
      }

      for (const slot of input.slots) {
        const allowed = allowedBundledIdsFor(slot.productId);
        for (const inc of slot.includedAccessories) {
          if (!allowed.has(inc.productId)) {
            throw new Error('Accessoire inclus invalide pour ce produit');
          }
        }
      }
      const standaloneIds = new Set(
        products
          .filter((p) => {
            const tags = parseTags(p.tags);
            return (
              tags.includes(UNIVERSAL_INCLUDED_TAG) ||
              tags.includes(STANDALONE_EXTRA_TAG)
            );
          })
          .map((p) => p.id.toString()),
      );
      for (const u of input.extras) {
        if (!standaloneIds.has(u.productId)) {
          throw new Error('Accessoire supplémentaire invalide');
        }
      }

      // Build line items. Same variantId is aggregated per "bucket":
      //   - Epic Box variants (full price)
      //   - Included accessory variants (100% discount, distinct line per slot
      //     to keep the discount line clean in Shopify reports)
      //   - Extra accessory units (full price, aggregated)
      const lineItems: LineItem[] = [];

      for (const slot of input.slots) {
        lineItems.push({
          variantId: Number(slot.variantId),
          quantity: 1,
        });
        for (const inc of slot.includedAccessories) {
          lineItems.push({
            variantId: Number(inc.variantId),
            quantity: 1,
            discountPercentage: 100,
            discountTitle: 'Inclus dans Epic Box',
          });
        }
      }

      const extrasByVariant = new Map<number, number>();
      for (const u of input.extras) {
        const id = Number(u.variantId);
        extrasByVariant.set(id, (extrasByVariant.get(id) ?? 0) + 1);
      }
      for (const [variantId, quantity] of extrasByVariant.entries()) {
        lineItems.push({ variantId, quantity });
      }

      // Subtotal counts only what's billed (Epic Box + extras)
      let subtotal = 0;
      for (const slot of input.slots) {
        subtotal += findVariantPrice(slot.productId, slot.variantId);
      }
      for (const u of input.extras) {
        subtotal += findVariantPrice(u.productId, u.variantId);
      }

      const shippingPrice =
        subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      const shippingTitle =
        shippingPrice === 0 ? 'Livraison offerte' : 'Livraison standard';

      const draft = await createDraftOrder(lineItems, input.customer, {
        title: shippingTitle,
        price: shippingPrice,
      });
      const completed = await completeDraftOrder(draft.id);

      return {
        draftOrderId: draft.id,
        orderName: completed.name,
        subtotal,
        shipping: shippingPrice,
        total: subtotal + shippingPrice,
      };
    }),
});
