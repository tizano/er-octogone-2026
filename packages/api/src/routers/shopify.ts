import { z } from "zod";
import { publicProcedure, router } from "../index";
import { completeDraftOrder, createDraftOrder, getProducts } from "../shopify";

const slotSchema = z.object({
	productId: z.string(),
	variantId: z.string().min(1, "Variant requis"),
});

const accessorySchema = z.object({
	productId: z.string(),
	variantId: z.string(),
	enabled: z.boolean(),
});

const addressSchema = z.object({
	lastName: z.string().min(1, "Nom requis"),
	firstName: z.string().min(1, "Prénom requis"),
	address1: z.string().min(1, "Adresse requise"),
	zip: z.string().min(4, "Code postal requis"),
	city: z.string().min(1, "Ville requise"),
});

const customerSchema = z.object({
	shipping: addressSchema,
	billing: addressSchema,
	email: z.string().email("Email invalide"),
	phone: z.string().optional(),
});

const createOrderSchema = z.object({
	mainSlots: z.array(slotSchema).min(1, "Sélectionnez au moins un produit"),
	accessories: z.array(accessorySchema),
	customer: customerSchema,
});

export const shopifyRouter = router({
	products: publicProcedure.query(async () => {
		return await getProducts();
	}),

	createOrder: publicProcedure.input(createOrderSchema).mutation(async ({ input }) => {
		// Aggregate line items: same variantId → sum quantities
		const variantQty = new Map<number, number>();

		for (const slot of input.mainSlots) {
			const id = Number(slot.variantId);
			variantQty.set(id, (variantQty.get(id) ?? 0) + 1);
		}

		for (const acc of input.accessories) {
			if (acc.enabled && acc.variantId) {
				const id = Number(acc.variantId);
				variantQty.set(id, (variantQty.get(id) ?? 0) + 1);
			}
		}

		const lineItems = Array.from(variantQty.entries()).map(([variantId, quantity]) => ({
			variantId,
			quantity,
		}));

		const draft = await createDraftOrder(lineItems, input.customer);
		const completed = await completeDraftOrder(draft.id);

		return {
			draftOrderId: draft.id,
			orderName: completed.name,
		};
	}),
});
