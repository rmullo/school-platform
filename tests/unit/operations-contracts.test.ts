import { describe, expect, it } from 'vitest';
import { completionSchema, documentReviewSchema, materialOrderInputSchema, reportFilterSchema, transitionSchema } from '@smartschool/contracts';

const id = '00000000-0000-4000-8000-000000000001';

describe('contratos das MD-11 a MD-15', () => {
  it('exige justificativa para exceção documental e pendência administrativa', () => {
    expect(documentReviewSchema.safeParse({ status: 'EXCEPTION', reason: null }).success).toBe(false);
    expect(completionSchema.safeParse({ complete: false, reason: null }).success).toBe(false);
    expect(documentReviewSchema.safeParse({ status: 'EXCEPTION', reason: 'Documento substituído por decisão registrada' }).success).toBe(true);
  });
  it('registra transição sem transformar revisão financeira em bloqueio', () => {
    const value = transitionSchema.parse({ operationKey: id, studentId: id, fromEnrollmentId: null, targetSchoolYearId: null, kind: 'TRANSFER', destination: 'Escola fictícia', acknowledgementAt: null, documentsReleased: true, financialReview: 'Acordo em análise; fluxo não bloqueado' });
    expect(value.documentsReleased).toBe(true);
  });
  it('mantém pedido de material opcional e estados de pagamento/entrega separados', () => {
    const value = materialOrderInputSchema.parse({ operationKey: id, studentId: id, enrollmentId: null, kitId: null, status: 'DRAFT', paymentStatus: 'NOT_APPLICABLE', deliveryStatus: 'NOT_APPLICABLE', notes: 'Compra opcional' });
    expect(value.paymentStatus).toBe('NOT_APPLICABLE'); expect(value.deliveryStatus).toBe('NOT_APPLICABLE');
  });
  it('valida o intervalo da consulta gerencial', () => {
    expect(reportFilterSchema.safeParse({ from: '2026-12-01', to: '2026-01-01', contractId: null }).success).toBe(false);
    expect(reportFilterSchema.parse({ from: '2026-01-01', to: '2026-12-31', contractId: id }).contractId).toBe(id);
  });
});
