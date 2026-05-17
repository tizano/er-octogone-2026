import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { CustomerForm } from '@/lib/order/schemas';

import { FieldError } from './field-error';

const inputCls =
  'w-full rounded border border-purple-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

type AddressKey = 'shipping' | 'billing';

type Props = {
  prefix: AddressKey;
  register: UseFormRegister<CustomerForm>;
  errors: FieldErrors<CustomerForm>;
};

export function AddressFields({ prefix, register, errors }: Props) {
  const error = errors[prefix];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register(`${prefix}.lastName`)}
            placeholder="Nom"
            className={inputCls}
          />
          <FieldError msg={error?.lastName?.message} />
        </div>
        <div>
          <input
            {...register(`${prefix}.firstName`)}
            placeholder="Prénom"
            className={inputCls}
          />
          <FieldError msg={error?.firstName?.message} />
        </div>
      </div>

      <div>
        <input
          {...register(`${prefix}.address1`)}
          placeholder="Adresse"
          className={inputCls}
        />
        <FieldError msg={error?.address1?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            {...register(`${prefix}.zip`)}
            placeholder="Code postal"
            className={inputCls}
          />
          <FieldError msg={error?.zip?.message} />
        </div>
        <div>
          <input
            {...register(`${prefix}.city`)}
            placeholder="Ville"
            className={inputCls}
          />
          <FieldError msg={error?.city?.message} />
        </div>
      </div>
    </div>
  );
}
