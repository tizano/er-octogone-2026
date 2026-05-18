import type { AppRouter } from '@er-octogone-2026/api/routers/index';
import { Toaster } from '@er-octogone-2026/ui/components/sonner';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';

import appCss from '../index.css?url';

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'OctoGônes 2026 - Epic Rolls' },
      { rel: 'robot', content: 'noindex' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Toaster richColors position="top-center" />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
