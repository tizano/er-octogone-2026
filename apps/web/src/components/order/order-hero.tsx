import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/order/schemas';

export function OrderHero() {
  return (
    <section className="mb-14">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e7e2ed] bg-white px-3 py-1.5 text-[11px] text-[#6b6573] uppercase tracking-widest">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4a2278] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4a2278]" />
        </span>
        Événement - OctoGônes 2026
      </div>

      <h1 className="mb-5 font-black text-4xl text-[#1c1a1e] uppercase leading-[0.95] tracking-tight sm:text-5xl">
        Out of stock
        <br />à OctoGônes&nbsp;?{' '}
        <span className="text-[#4a2278] block">Passez commande ici.</span>
      </h1>

      <p className="max-w-md text-[#6b6573] text-base leading-relaxed">
        Réservez votre Epic Box{' '}
        <strong className="font-semibold text-[#1c1a1e]">
          avant tout le monde 🔥
        </strong>
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#e7e2ed] bg-white px-3 py-2 text-[13px] text-[#1c1a1e]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="text-[#4a2278]"
        >
          <path
            d="M1.5 5.5h9v5h-9zM10.5 7h2.5l1.5 1.5v2H10.5z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle
            cx="4.5"
            cy="11.5"
            r="1.2"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle
            cx="11.5"
            cy="11.5"
            r="1.2"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
        <span>
          Livraison{' '}
          <strong className="font-semibold">
            offerte dès {FREE_SHIPPING_THRESHOLD}€
          </strong>{' '}
          <span className="text-[#6b6573]">
            - sinon {SHIPPING_FEE.toFixed(2).replace('.', ',')}€
          </span>
        </span>
      </div>
    </section>
  );
}
