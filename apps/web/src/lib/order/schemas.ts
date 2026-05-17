import { z } from 'zod';

export const addressSchema = z.object({
  lastName: z.string().min(1, 'Nom requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  address1: z.string().min(1, 'Adresse requise'),
  zip: z.string().min(4, 'Code postal requis'),
  city: z.string().min(1, 'Ville requise'),
});

export type Address = z.infer<typeof addressSchema>;

// Always-present shape; billing is validated conditionally below
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
    phone: z.string().optional(),
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
