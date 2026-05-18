import { createEnv } from '@t3-oss/env-core';
import 'dotenv/config';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    SHOPIFY_SHOP: z.string().min(1),
    SHOPIFY_CLIENT_ID: z.string().min(1),
    SHOPIFY_CLIENT_SECRET: z.string().min(1),
    SHOPIFY_APP_AUTOMATION_TOKEN: z.string().min(1),
    DISCORD_WEBHOOK_URL: z.string().min(1),
    DISCORD_ROLE_ID: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
