import { env } from "@er-octogone-2026/env/server";

const SHOPIFY_API_VERSION = "2025-01";

function shopDomain(): string {
	return env.SHOPIFY_SHOP.includes(".") ? env.SHOPIFY_SHOP : `${env.SHOPIFY_SHOP}.myshopify.com`;
}

// ─── OAuth client_credentials token caching ───────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
	if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

	const res = await fetch(`https://${shopDomain()}/admin/oauth/access_token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "client_credentials",
			client_id: env.SHOPIFY_CLIENT_ID,
			client_secret: env.SHOPIFY_CLIENT_SECRET,
		}),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Shopify token request failed: ${res.status} — ${body}`);
	}

	const data = (await res.json()) as { access_token: string; expires_in: number };
	cachedToken = data.access_token;
	tokenExpiresAt = Date.now() + data.expires_in * 1000;
	return cachedToken;
}

// ─── GraphQL helper ──────────────────────────────────────────────────────────

interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{ message: string }>;
}

async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
	const res = await fetch(`https://${shopDomain()}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Shopify-Access-Token": await getToken(),
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Shopify GraphQL failed: ${res.status} — ${body}`);
	}

	const body = (await res.json()) as GraphQLResponse<T>;
	if (body.errors?.length) {
		throw new Error(`Shopify GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`);
	}
	if (!body.data) throw new Error("Shopify GraphQL returned no data");
	return body.data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gidToId(gid: string): string {
	return gid.split("/").pop() ?? "";
}

function variantGid(id: string | number): string {
	return `gid://shopify/ProductVariant/${id}`;
}

function draftOrderGid(id: string | number): string {
	return `gid://shopify/DraftOrder/${id}`;
}

// ─── Public types (REST-like shape kept for LP compatibility) ────────────────

export interface ShopifyVariant {
	id: number;
	product_id: number;
	title: string;
	price: string;
	option1: string | null;
	option2: string | null;
	option3: string | null;
	available: boolean;
}

export interface ShopifyOption {
	id: number;
	name: string;
	values: string[];
}

export interface ShopifyProduct {
	id: number;
	title: string;
	body_html: string;
	product_type: string;
	tags: string;
	variants: ShopifyVariant[];
	options: ShopifyOption[];
	images: Array<{ id: number; src: string }>;
}

// ─── Products query ──────────────────────────────────────────────────────────

interface GqlProductNode {
	id: string;
	title: string;
	descriptionHtml: string;
	productType: string;
	tags: string[];
	options: Array<{ id: string; name: string; values: string[] }>;
	variants: {
		edges: Array<{
			node: {
				id: string;
				title: string;
				price: string;
				availableForSale: boolean;
				selectedOptions: Array<{ name: string; value: string }>;
			};
		}>;
	};
	images: { edges: Array<{ node: { id: string; url: string } }> };
}

interface GqlProductsResponse {
	products: { edges: Array<{ node: GqlProductNode }> };
}

const PRODUCTS_QUERY = `
	query GetProducts {
		products(first: 50) {
			edges {
				node {
					id
					title
					descriptionHtml
					productType
					tags
					options { id name values }
					variants(first: 100) {
						edges {
							node {
								id
								title
								price
								availableForSale
								selectedOptions { name value }
							}
						}
					}
					images(first: 10) {
						edges { node { id url } }
					}
				}
			}
		}
	}
`;

export async function getProducts(): Promise<ShopifyProduct[]> {
	const data = await graphql<GqlProductsResponse>(PRODUCTS_QUERY);

	return data.products.edges.map(({ node: p }) => {
		const productId = Number(gidToId(p.id));
		const options: ShopifyOption[] = p.options.map((o) => ({
			id: Number(gidToId(o.id)),
			name: o.name,
			values: o.values,
		}));

		const variants: ShopifyVariant[] = p.variants.edges.map(({ node: v }) => {
			const byName: Record<string, string> = Object.fromEntries(
				v.selectedOptions.map((o) => [o.name, o.value]),
			);
			return {
				id: Number(gidToId(v.id)),
				product_id: productId,
				title: v.title,
				price: String(v.price),
				option1: options[0] ? (byName[options[0].name] ?? null) : null,
				option2: options[1] ? (byName[options[1].name] ?? null) : null,
				option3: options[2] ? (byName[options[2].name] ?? null) : null,
				available: v.availableForSale,
			};
		});

		return {
			id: productId,
			title: p.title,
			body_html: p.descriptionHtml,
			product_type: p.productType,
			tags: p.tags.join(", "),
			options,
			variants,
			images: p.images.edges.map(({ node: img }) => ({
				id: Number(gidToId(img.id)),
				src: img.url,
			})),
		};
	});
}

// ─── Draft order mutations ───────────────────────────────────────────────────

export interface LineItem {
	variantId: number;
	quantity: number;
}

export interface AddressInput {
	firstName: string;
	lastName: string;
	address1: string;
	zip: string;
	city: string;
}

export interface CustomerInput {
	shipping: AddressInput;
	billing: AddressInput;
	email: string;
	phone?: string;
}

interface GqlDraftOrderCreateResponse {
	draftOrderCreate: {
		draftOrder: { id: string; name: string } | null;
		userErrors: Array<{ field: string[] | null; message: string }>;
	};
}

const DRAFT_ORDER_CREATE_MUTATION = `
	mutation DraftOrderCreate($input: DraftOrderInput!) {
		draftOrderCreate(input: $input) {
			draftOrder { id name }
			userErrors { field message }
		}
	}
`;

export async function createDraftOrder(
	lineItems: LineItem[],
	customer: CustomerInput,
): Promise<{ id: number; name: string; gid: string }> {
	const toMailingAddress = (addr: AddressInput, phone?: string) => ({
		firstName: addr.firstName,
		lastName: addr.lastName,
		address1: addr.address1,
		zip: addr.zip,
		city: addr.city,
		countryCode: "FR",
		phone,
	});

	const input = {
		email: customer.email,
		note: "Commande passée via la LP Octogone 2026",
		tags: ["octogone-2026"],
		shippingAddress: toMailingAddress(customer.shipping, customer.phone),
		billingAddress: toMailingAddress(customer.billing, customer.phone),
		lineItems: lineItems.map((item) => ({
			variantId: variantGid(item.variantId),
			quantity: item.quantity,
		})),
		metafields: [
			{
				namespace: "custom",
				key: "event",
				value: "octogone-2026",
				type: "single_line_text_field",
			},
		],
	};

	const data = await graphql<GqlDraftOrderCreateResponse>(DRAFT_ORDER_CREATE_MUTATION, { input });

	if (data.draftOrderCreate.userErrors.length > 0) {
		const msg = data.draftOrderCreate.userErrors
			.map((e) => `${e.field?.join(".") ?? "?"}: ${e.message}`)
			.join("; ");
		throw new Error(`Draft order creation rejected: ${msg}`);
	}

	const draft = data.draftOrderCreate.draftOrder;
	if (!draft) throw new Error("Draft order creation returned null");

	return {
		id: Number(gidToId(draft.id)),
		name: draft.name,
		gid: draft.id,
	};
}

interface GqlDraftOrderCompleteResponse {
	draftOrderComplete: {
		draftOrder: { id: string; name: string } | null;
		userErrors: Array<{ field: string[] | null; message: string }>;
	};
}

const DRAFT_ORDER_COMPLETE_MUTATION = `
	mutation DraftOrderComplete($id: ID!, $paymentPending: Boolean!) {
		draftOrderComplete(id: $id, paymentPending: $paymentPending) {
			draftOrder {
				id
				name
			}
			userErrors { field message }
		}
	}
`;

export async function completeDraftOrder(draftOrderId: number): Promise<{ id: number; name: string }> {
	const data = await graphql<GqlDraftOrderCompleteResponse>(DRAFT_ORDER_COMPLETE_MUTATION, {
		id: draftOrderGid(draftOrderId),
		paymentPending: false, // false → financialStatus: PAID
	});

	if (data.draftOrderComplete.userErrors.length > 0) {
		const msg = data.draftOrderComplete.userErrors
			.map((e) => `${e.field?.join(".") ?? "?"}: ${e.message}`)
			.join("; ");
		throw new Error(`Draft order completion rejected: ${msg}`);
	}

	const draft = data.draftOrderComplete.draftOrder;
	if (!draft) throw new Error("Draft order completion returned null");

	return {
		id: Number(gidToId(draft.id)),
		name: draft.name,
	};
}
