import type {
  Control,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import type { CustomerForm } from '@/lib/order/schemas';

import { AddressFields } from './address-fields';
import { FieldError } from './field-error';

const inputCls =
  'w-full rounded border border-purple-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

const sectionTitleCls =
  'bg-[#4a2278] text-white font-black uppercase px-4 py-2 rounded-sm text-sm tracking-wider';

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
    <div className="space-y-6">
      {/* Shipping */}
      <div className="space-y-4">
        <div className={sectionTitleCls}>Vos coordonnées de livraison :</div>
        <AddressFields prefix="shipping" register={register} errors={errors} />

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className={inputCls}
          />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder="Téléphone"
            className={inputCls}
          />
          <FieldError msg={errors.phone?.message} />
        </div>
      </div>

      {/* Billing toggle */}
      <label className="flex items-center gap-3 cursor-pointer px-1">
        <input
          type="checkbox"
          {...register('billingSameAsShipping')}
          className="h-4 w-4 accent-purple-700"
        />
        <span className="text-sm font-medium">
          Adresse de facturation identique à la livraison
        </span>
      </label>

      {/* Billing (conditional) */}
      {!billingSameAsShipping && (
        <div className="space-y-4">
          <div className={sectionTitleCls}>
            Vos coordonnées de facturation :
          </div>
          <AddressFields prefix="billing" register={register} errors={errors} />
        </div>
      )}
    </div>
  );
}
