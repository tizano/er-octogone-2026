import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import type { CustomerForm } from '@/lib/order/schemas';

import { AddressFields } from './address-fields';
import { FieldError } from './field-error';

const inputCls =
  'h-10 w-full rounded-md border border-[#d8d2e0] bg-white px-3 text-sm text-[#1c1a1e] placeholder:text-[#8b8694] focus:border-[#4a2278] focus:outline-none focus:ring-2 focus:ring-[#4a2278]/20 transition-colors';

const labelCls = 'font-medium text-[13px] text-[#1c1a1e]';

type Props = {
  register: UseFormRegister<CustomerForm>;
  control: Control<CustomerForm>;
  errors: FieldErrors<CustomerForm>;
};

export function CustomerSection({ register, control, errors }: Props) {
  const billingSameAsShipping = useWatch({
    control,
    name: 'billingSameAsShipping',
  });

  return (
    <section className="rounded-2xl border border-[#e7e2ed] bg-white p-6 sm:p-7">
      <div className="mb-2">
        <div className="mb-1 text-[11px] text-[#8b8694] uppercase tracking-[0.12em]">
          02 - Livraison
        </div>
        <h2 className="font-black text-2xl text-[#1c1a1e] uppercase leading-none tracking-wide">
          Vos coordonnées
        </h2>
      </div>
      <p className="mb-6 text-[#6b6573] text-sm leading-relaxed">
        Pour la livraison et l'envoi du récapitulatif.
      </p>

      <div className="flex flex-col gap-4">
        <AddressFields prefix="shipping" register={register} errors={errors} />

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="customer.email">
            Email <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id="customer.email"
            {...register('email')}
            type="email"
            placeholder="jean@exemple.com"
            className={inputCls}
          />
          <FieldError msg={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="customer.phone">
            Téléphone <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id="customer.phone"
            {...register('phone')}
            type="tel"
            placeholder="06 12 34 56 78"
            className={inputCls}
          />
          <FieldError msg={errors.phone?.message} />
        </div>

        <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-[14px] text-[#1c1a1e]">
          <input
            type="checkbox"
            {...register('billingSameAsShipping')}
            className="h-4 w-4 accent-[#4a2278]"
          />
          <span>Adresse de facturation identique à la livraison</span>
        </label>

        {!billingSameAsShipping && (
          <div className="mt-4 flex flex-col gap-4 border-t border-[#e7e2ed] pt-6">
            <div>
              <div className="mb-1 text-[11px] text-[#8b8694] uppercase tracking-[0.12em]">
                Facturation
              </div>
              <h3 className="font-black text-lg text-[#1c1a1e] uppercase leading-none tracking-wide">
                Adresse de facturation
              </h3>
            </div>
            <AddressFields
              prefix="billing"
              register={register}
              errors={errors}
            />
          </div>
        )}
      </div>
    </section>
  );
}
