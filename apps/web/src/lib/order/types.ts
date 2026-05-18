export type IncludedAccessory = {
  productId: string;
  variantId: string;
};

export type ProductSlot = {
  slotId: string;
  productId: string;
  variantId: string;
  includedAccessories: IncludedAccessory[];
};

export type AccessoryUnit = {
  unitId: string;
  variantId: string;
};

export type AccessoryExtras = Record<string, AccessoryUnit[]>;
