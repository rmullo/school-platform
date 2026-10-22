import { describe, expect, it } from 'vitest';
import { enrollmentConfirmationSchema, enrollmentInputSchema } from '@smartschool/contracts';

const base = { studentId: '00000000-0000-4000-8000-000000000001', classroomId: '00000000-0000-4000-8000-000000000002', campaignId: '00000000-0000-4000-8000-000000000003', contractId: '00000000-0000-4000-8000-000000000004', financialResponsibleId: '00000000-0000-4000-8000-000000000005', pendingItems: ['Documento de identidade'] };

describe('rascunho de matrícula da MD-06', () => {
  it('aceita aluno, turma, campanha, plano e pendências', () => { expect(enrollmentInputSchema.parse(base).pendingItems).toEqual(['Documento de identidade']); });
  it('rejeita pendência vazia e excesso de itens', () => { expect(enrollmentInputSchema.safeParse({ ...base, pendingItems: [''] }).success).toBe(false); expect(enrollmentInputSchema.safeParse({ ...base, pendingItems: Array.from({ length: 21 }, (_, index) => `Item ${index}`) }).success).toBe(false); });
  it('rejeita campos não previstos no rascunho', () => { expect(enrollmentInputSchema.safeParse({ ...base, occupied: true }).success).toBe(false); });
  it('exige motivo para dispensa ou negociação formal', () => { expect(enrollmentConfirmationSchema.safeParse({ draftVersion: 1, operationKey: '00000000-0000-4000-8000-000000000006', settlement: 'WAIVER', amountCents: 120000 }).success).toBe(false); expect(enrollmentConfirmationSchema.safeParse({ draftVersion: 1, operationKey: '00000000-0000-4000-8000-000000000006', settlement: 'PAYMENT', amountCents: 120000, method: 'MANUAL' }).success).toBe(true); });
});
