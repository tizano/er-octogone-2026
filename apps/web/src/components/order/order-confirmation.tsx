export function OrderConfirmation({ orderName }: { orderName: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center"
      style={{ background: '#f0eef8' }}
    >
      <div className="bg-[#4a2278] text-white font-black uppercase text-lg px-6 py-4 rounded-sm mb-8 tracking-wider">
        Enregistrer ma commande
      </div>

      <div className="text-4xl mb-2">↓</div>

      <h2 className="text-2xl font-black uppercase mt-4 mb-2">
        Votre commande a été enregistrée 🎉
      </h2>

      <p className="text-sm text-gray-500 mb-6 font-mono">{orderName}</p>

      <div className="bg-[#4a2278] text-white font-bold uppercase text-center px-6 py-6 rounded-sm max-w-sm text-sm leading-relaxed">
        Pour quelle soit validée, merci de venir payer au stand et de demander
        un reçu par mail ou SMS obligatoire
      </div>

      <p className="mt-8 text-base text-gray-700">
        Votre commande sera expédiée entre le 26 et le 2 juin
      </p>

      <p className="mt-10 font-black uppercase tracking-widest text-gray-800">
        Merci pour votre confiance !
      </p>

      <div className="mt-8 text-gray-400 text-xs font-mono tracking-widest uppercase">
        Epic Rolls · Less mess, more crit.
      </div>
    </div>
  );
}
