import { publicProcedure, router } from "../index";
import { shopifyRouter } from "./shopify";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  shopify: shopifyRouter,
});
export type AppRouter = typeof appRouter;
