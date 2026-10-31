export interface Tax {
  id: string;
  name: string;
  type: string;
  rate: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaxResponseDto {
  id: string;
  name: string;
  type: string;
  rate: number;
  active: boolean;
}

export const formatTaxResponse = (tax: Tax): TaxResponseDto => ({
  id: tax.id,
  name: tax.name,
  type: tax.type,
  rate: Number(tax.rate),
  active: Boolean(tax.active),
});
