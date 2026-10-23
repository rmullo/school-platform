import { describe, expect, it } from 'vitest';
import { cancellationInputSchema, enrollmentConfirmationSchema, enrollmentInputSchema, negotiationInputSchema, paymentInputSchema, paymentReversalSchema, refundInputSchema } from '@smartschool/contracts';

const base = { studentId: '00000000-0000-4000-8000-000000000001', classroomId: '00000000-0000-4000-8000-000000000002', campaignId: '00000000-0000-4000-8000-000000000003', contractId: '00000000-0000-4000-8000-000000000004', financialResponsibleId: '00000000-0000-4000-8000-000000000005', pendingItems: ['Documento de identidade'] };

describe('rascunho de matrícula da MD-06', () => {
  it('aceita aluno, turma, campanha, plano e pendências', () => { expect(enrollmentInputSchema.parse(base).pendingItems).toEqual(['Documento de identidade']); });
  it('rejeita pendência vazia e excesso de itens', () => { expect(enrollmentInputSchema.safeParse({ ...base, pendingItems: [''] }).success).toBe(false); expect(enrollmentInputSchema.safeParse({ ...base, pendingItems: Array.from({ length: 21 }, (_, index) => `Item ${index}`) }).success).toBe(false); });
  it('rejeita campos não previstos no rascunho', () => { expect(enrollmentInputSchema.safeParse({ ...base, occupied: true }).success).toBe(false); });
  it('exige motivo para dispensa ou negociação formal', () => { expect(enrollmentConfirmationSchema.safeParse({ draftVersion: 1, operationKey: '00000000-0000-4000-8000-000000000006', settlement: 'WAIVER', amountCents: 120000 }).success).toBe(false); expect(enrollmentConfirmationSchema.safeParse({ draftVersion: 1, operationKey: '00000000-0000-4000-8000-000000000006', settlement: 'PAYMENT', amountCents: 120000, method: 'MANUAL' }).success).toBe(true); });
});

describe('recebimentos da MD-08', () => {
  const obligationId = '00000000-0000-4000-8000-000000000011';
  const basePayment = { operationKey: '00000000-0000-4000-8000-000000000012', amountCents: 100000, method: 'MANUAL' as const, allocations: [{ obligationId, amountCents: 90000 }] };

  it('aceita pagamento parcial ou com crédito excedente', () => {
    expect(paymentInputSchema.parse(basePayment).allocations[0].amountCents).toBe(90000);
    expect(paymentInputSchema.parse({ ...basePayment, allocations: [{ obligationId, amountCents: 100000 }] }).amountCents).toBe(100000);
  });
  it('rejeita alocação acima do recebido e obrigação repetida', () => {
    expect(paymentInputSchema.safeParse({ ...basePayment, allocations: [{ obligationId, amountCents: 100001 }] }).success).toBe(false);
    expect(paymentInputSchema.safeParse({ ...basePayment, allocations: [{ obligationId, amountCents: 50000 }, { obligationId, amountCents: 50000 }] }).success).toBe(false);
  });
  it('exige motivo suficiente para reversão', () => {
    expect(paymentReversalSchema.safeParse({ operationKey: basePayment.operationKey, reason: 'ok' }).success).toBe(false);
    expect(paymentReversalSchema.safeParse({ operationKey: basePayment.operationKey, reason: 'Lançamento incorreto' }).success).toBe(true);
  });
  it('aceita somente mês civil válido para entrada tardia', () => {
    expect(enrollmentInputSchema.safeParse({ ...base, entryMonth: 8 }).success).toBe(true);
    expect(enrollmentInputSchema.safeParse({ ...base, entryMonth: 13 }).success).toBe(false);
  });
  it('exige motivo e data civil na negociação', () => {
    expect(negotiationInputSchema.safeParse({ operationKey: basePayment.operationKey, obligationId, negotiatedAmountCents: 90000, negotiatedDueDate: '2097-08-10', reason: 'Acordo autorizado' }).success).toBe(true);
    expect(negotiationInputSchema.safeParse({ operationKey: basePayment.operationKey, obligationId, negotiatedAmountCents: 90000, negotiatedDueDate: '10/08/2097', reason: 'Acordo autorizado' }).success).toBe(false);
  });
  it('exige data efetiva e motivo para cancelamento', () => {
    expect(cancellationInputSchema.safeParse({ operationKey: basePayment.operationKey, effectiveDate: '2097-08-10', reason: 'Desistência fictícia' }).success).toBe(true);
    expect(cancellationInputSchema.safeParse({ operationKey: basePayment.operationKey, effectiveDate: '10/08/2097', reason: 'Desistência fictícia' }).success).toBe(false);
  });
  it('separa restituição efetiva de reversão e exige valor positivo', () => {
    expect(refundInputSchema.safeParse({ operationKey: basePayment.operationKey, amountCents: 90000, method: 'MANUAL', reason: 'Devolução fictícia' }).success).toBe(true);
    expect(refundInputSchema.safeParse({ operationKey: basePayment.operationKey, amountCents: 0, method: 'MANUAL', reason: 'Devolução fictícia' }).success).toBe(false);
  });
});
