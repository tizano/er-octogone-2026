import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { CustomerForm } from '@/lib/order/schemas';

import { FieldError } from './field-error';

const inputCls =
  'h-10 w-full rounded-md border border-[#d8d2e0] bg-white px-3 text-sm text-[#1c1a1e] placeholder:text-[#8b8694] focus:border-[#4a2278] focus:outline-none focus:ring-2 focus:ring-[#4a2278]/20 transition-colors';

const labelCls =
  'font-medium text-[13px] text-[#1c1a1e]';

type AddressKey = 'shipping' | 'billing';

type Props = {
  prefix: AddressKey;
  register: UseFormRegister<CustomerForm>;
  errors: FieldErrors<CustomerForm>;
};

export function AddressFields({ prefix, register, errors }: Props) {
  const error = errors[prefix];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor={`${prefix}.lastName`}>
            Nom <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id={`${prefix}.lastName`}
            {...register(`${prefix}.lastName`)}
            placeholder="Dupont"
            className={inputCls}
          />
          <FieldError msg={error?.lastName?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor={`${prefix}.firstName`}>
            Prénom <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id={`${prefix}.firstName`}
            {...register(`${prefix}.firstName`)}
            placeholder="Jean"
            className={inputCls}
          />
          <FieldError msg={error?.firstName?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls} htmlFor={`${prefix}.address1`}>
          Adresse <span className="text-[#4a2278]">*</span>
        </label>
        <input
          id={`${prefix}.address1`}
          {...register(`${prefix}.address1`)}
          placeholder="12 rue des Dés"
          className={inputCls}
        />
        <FieldError msg={error?.address1?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor={`${prefix}.zip`}>
            Code postal <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id={`${prefix}.zip`}
            {...register(`${prefix}.zip`)}
            placeholder="69000"
            inputMode="numeric"
            className={inputCls}
          />
          <FieldError msg={error?.zip?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor={`${prefix}.city`}>
            Ville <span className="text-[#4a2278]">*</span>
          </label>
          <input
            id={`${prefix}.city`}
            {...register(`${prefix}.city`)}
            placeholder="Lyon"
            className={inputCls}
          />
          <FieldError msg={error?.city?.message} />
        </div>
      </div>
    </div>
  );
}
