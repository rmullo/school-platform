import { describe, expect, it } from 'vitest';
import { contractInputSchema } from '@smartschool/contracts';

const base = { campaignId: '00000000-0000-4000-8000-000000000001', version: 1, title: 'Plano fictício', totalAnnualCents: 1200000, initialInstallmentCents: 120000, remainingInstallmentCents: 90000, remainingInstallmentCount: 12, siblingDiscountBps: 1000, punctualityDiscountCents: 5000, materialCollectiveRequired: false as const, terms: 'Termos fictícios para demonstração.', validFrom: '2026-01-01', validUntil: '2026-12-31' };

describe('plano contratual da MD-05', () => {
  it('aceita a parcela inicial dentro do total anual', () => {
    expect(contractInputSchema.parse(base).totalAnnualCents).toBe(1200000);
  });
  it('rejeita composição que não fecha o total', () => {
    expect(contractInputSchema.safeParse({ ...base, totalAnnualCents: 1200001 }).success).toBe(false);
  });
  it('não aceita material coletivo obrigatório', () => {
    expect(contractInputSchema.safeParse({ ...base, materialCollectiveRequired: true }).success).toBe(false);
  });
});
