export function OrderConfirmation({ orderName }: { orderName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f0eef8]">
      <main className="mx-auto w-full max-w-xl px-5 py-16 sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#4a2278]/10 px-3 py-1.5 font-semibold text-[11px] text-[#4a2278] uppercase tracking-[0.12em]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 7L6 10.5L11.5 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Commande enregistrée
        </div>

        <h1 className="mb-5 font-black text-4xl text-[#1c1a1e] uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Votre commande
          <br />
          est <span className="text-[#4a2278]">en attente de validation.</span>
        </h1>

        <p className="max-w-md text-[#6b6573] text-base leading-relaxed">
          Pour qu'elle soit validée,{' '}
          <strong className="font-semibold text-[#1c1a1e]">
            passez payer au stand Epic Rolls
          </strong>{' '}
          à OctoGônes et demandez votre reçu par mail ou SMS,{' '}
          <strong className="font-semibold text-[#1c1a1e]">
            c'est obligatoire.
          </strong>
        </p>

        <p className="mt-3 font-mono text-[#8b8694] text-xs">{orderName}</p>

        <div className="mt-10 rounded-2xl border border-[#e7e2ed] bg-white p-2">
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#f9f5ff] text-[#4a2278]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="14"
                  height="11"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path d="M3 8H17" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M7 3V6M13 3V6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="mb-0.5 text-[12px] text-[#6b6573]">
                Expédition prévue
              </div>
              <div className="font-medium text-[15px] text-[#1c1a1e]">
                Entre le 26 mai et le 2 juin
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-[#e7e2ed] border-t p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#f9f5ff] text-[#4a2278]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="4"
                  width="14"
                  height="12"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M3 5L10 11L17 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="mb-0.5 text-[12px] text-[#6b6573]">
                Confirmation envoyée
              </div>
              <div className="font-medium text-[15px] text-[#1c1a1e]">
                Vous devriez avoir reçu un récap par email.
              </div>
            </div>
          </div>
        </div>

        <p className="mt-14 text-center font-black text-[#8b8694] text-xl uppercase tracking-wide">
          Merci pour votre confiance.
        </p>
      </main>
    </div>
  );
}
