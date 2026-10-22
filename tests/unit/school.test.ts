import { describe, expect, it } from 'vitest';
import { authorizationCovers, authorizationSchema, classroomInputSchema, schoolYearInputSchema, stageInputSchema } from '@smartschool/contracts';
const authorization = { authority: 'Órgão Fictício', act: 'Ato Fictício 01', evidence: 'Referência fictícia para testes', validFrom: '2026-01-01', validUntil: '2026-12-31', demonstration: true };
describe('Contratos da estrutura escolar', () => {
  it('valida datas civis reais e ordem dos períodos sem conversão de fuso', () => {
    expect(schoolYearInputSchema.safeParse({ year: 2026, startDate: '2026-02-30', endDate: '2026-12-01' }).success).toBe(false);
    expect(schoolYearInputSchema.safeParse({ year: 2026, startDate: '2026-12-01', endDate: '2026-02-01' }).success).toBe(false);
    expect(authorizationSchema.safeParse({ ...authorization, validUntil: '2025-01-01' }).success).toBe(false);
  });
  it.each([0, -1, 1.5, 2147483648])('rejeita capacidade inválida %s', capacity => {
    expect(classroomInputSchema.safeParse({ name: 'Turma A', gradeId: '6886c110-bb11-4f42-9986-28f0134c3354', schoolYearId: 'ddfc1bdc-a634-4d0a-8934-945b2e8887d7', capacity }).success).toBe(false);
  });
  it('não aceita ocupação/ativação via cadastro nem ensino médio', () => {
    expect(stageInputSchema.safeParse({ name: 'Etapa', segment: 'MEDIO', authorization: null }).success).toBe(false);
    expect(classroomInputSchema.safeParse({ name: 'Turma A', gradeId: '6886c110-bb11-4f42-9986-28f0134c3354', schoolYearId: 'ddfc1bdc-a634-4d0a-8934-945b2e8887d7', capacity: 10, occupied: 0, active: true }).success).toBe(false);
  });
  it('exige cobertura completa e respeita o último dia de validade', () => {
    const year = { startDate: '2026-02-01', endDate: '2026-12-31' };
    expect(authorizationCovers(authorization, year, '2026-12-31')).toBe(true);
    expect(authorizationCovers(authorization, year, '2027-01-01')).toBe(false);
    expect(authorizationCovers(null, year, '2026-01-01')).toBe(false);
    expect(authorizationCovers(authorization, { ...year, endDate: '2027-01-01' }, '2026-01-01')).toBe(false);
    expect(authorizationCovers({ ...authorization, validFrom: '2026-03-01' }, year, '2026-01-01')).toBe(false);
  });
});
