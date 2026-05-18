import { env } from '@er-octogone-2026/env/server';

const OCTOGONE_PURPLE = 0x4a2278;

export interface DiscordOrderLine {
  title: string;
  variantTitle?: string;
  quantity: number;
  included?: boolean;
}

export interface DiscordOrderPayload {
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingCity: string;
  subtotal: number;
  shipping: number;
  total: number;
  lines: DiscordOrderLine[];
}

function formatLine(line: DiscordOrderLine): string {
  const variant =
    line.variantTitle && line.variantTitle !== 'Default Title'
      ? ` — ${line.variantTitle}`
      : '';
  const tag = line.included ? ' _(inclus)_' : '';
  return `• ${line.quantity}× ${line.title}${variant}${tag}`;
}

export async function notifyDiscordOrder(
  payload: DiscordOrderPayload,
): Promise<void> {
  const linesField =
    payload.lines.map(formatLine).join('\n').slice(0, 1024) ||
    '_(aucun article)_';

  const body = {
    content: `<@&${env.DISCORD_ROLE_ID}> Nouvelle commande Epic Rolls - OctoGônes 2026`,
    embeds: [
      {
        title: `Commande ${payload.orderName}`,
        color: OCTOGONE_PURPLE,
        fields: [
          {
            name: 'Client',
            value: `${payload.customerName}\n${payload.customerEmail}\n${payload.customerPhone}`,
            inline: true,
          },
          {
            name: 'Articles',
            value: linesField,
          },
          // {
          //   name: 'Sous-total',
          //   value: `${payload.subtotal.toFixed(2)} €`,
          //   inline: true,
          // },
          // {
          //   name: 'Livraison',
          //   value:
          //     payload.shipping === 0
          //       ? 'Offerte'
          //       : `${payload.shipping.toFixed(2)} €`,
          //   inline: true,
          // },
          {
            name: 'Total',
            value: `**${payload.total.toFixed(2)} €**`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed: ${res.status} - ${text}`);
  }
}
