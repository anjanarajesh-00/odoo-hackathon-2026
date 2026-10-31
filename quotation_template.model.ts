export interface QuotationTemplateLine {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  plan_id: string;
  validity_days: number;
  lines?: string | null; // JSON string
  created_at: Date;
  updated_at: Date;
}

export interface QuotationTemplateResponseDto {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  lines: QuotationTemplateLine[];
}

export const formatTemplateResponse = (t: QuotationTemplate): QuotationTemplateResponseDto => {
  let parsedLines: QuotationTemplateLine[] = [];
  try {
    if (t.lines) parsedLines = JSON.parse(t.lines);
  } catch (e) {
    parsedLines = [];
  }
  return {
    id: t.id,
    name: t.name,
    planId: t.plan_id,
    validityDays: Number(t.validity_days),
    lines: parsedLines,
  };
};
