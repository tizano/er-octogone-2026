import { createEnv } from '@t3-oss/env-core';
import 'dotenv/config';
import { z } from 'zod';

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.url().optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    SHOPIFY_SHOP: z.string().min(1),
    SHOPIFY_CLIENT_ID: z.string().min(1),
    SHOPIFY_CLIENT_SECRET: z.string().min(1),
    SHOPIFY_APP_AUTOMATION_TOKEN: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
