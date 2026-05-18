import { z } from 'zod';

const zipRegex = /^\d{5}$/;

const phoneSchema = z
  .string()
  .min(1, 'Téléphone requis')
  .refine((val) => {
    const cleaned = val.replace(/[\s.\-()]/g, '');
    return /^\+?\d{9,15}$/.test(cleaned);
  }, 'Téléphone invalide');

export const addressSchema = z.object({
  lastName: z.string().min(1, 'Nom requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  address1: z.string().min(1, 'Adresse requise'),
  zip: z.string().regex(zipRegex, 'Code postal invalide (5 chiffres)'),
  city: z.string().min(1, 'Ville requise'),
});

export type Address = z.infer<typeof addressSchema>;

const looseAddress = z.object({
  lastName: z.string(),
  firstName: z.string(),
  address1: z.string(),
  zip: z.string(),
  city: z.string(),
});

export const customerSchema = z
  .object({
    shipping: addressSchema,
    email: z.string().email('Email invalide'),
    phone: phoneSchema,
    billingSameAsShipping: z.boolean(),
    billing: looseAddress,
  })
  .superRefine((data, ctx) => {
    if (data.billingSameAsShipping) return;
    const result = addressSchema.safeParse(data.billing);
    if (result.success) return;
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: 'custom',
        message: issue.message,
        path: ['billing', ...issue.path],
      });
    }
  });

export type CustomerForm = z.infer<typeof customerSchema>;

export const emptyAddress: Address = {
  lastName: '',
  firstName: '',
  address1: '',
  zip: '',
  city: '',
};

export const FREE_SHIPPING_THRESHOLD = 85;
export const SHIPPING_FEE = 4.9;
