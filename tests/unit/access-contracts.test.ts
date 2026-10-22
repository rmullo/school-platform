import { describe, expect, it } from 'vitest';
import { createUserSchema, changeUserSchema, loginSchema } from '@smartschool/contracts';

describe('Fronteiras de acesso', () => {
  it('normaliza e-mail e exige senha de criação de pelo menos 12 caracteres', () => {
    const value = { name: 'Diretor Exemplo', email: 'DIRETOR@example.test', password: 'fictitious-password-2026', role: 'DIRECTOR' };
    expect(createUserSchema.parse(value).email).toBe('diretor@example.test');
    expect(createUserSchema.safeParse({ ...value, password: 'short' }).success).toBe(false);
  });
  it('não aceita escalada por campos extras ou perfil desconhecido', () => {
    expect(loginSchema.safeParse({ email: 'a@example.test', password: 'abc', role: 'DIRECTOR' }).success).toBe(false);
    expect(changeUserSchema.safeParse({ role: 'ADMIN', reason: 'Teste fictício' }).success).toBe(false);
  });
  it('exige motivo e mudança efetiva na alteração', () => {
    expect(changeUserSchema.safeParse({ active: false, reason: 'x' }).success).toBe(false);
    expect(changeUserSchema.safeParse({ reason: 'Motivo fictício' }).success).toBe(false);
    expect(changeUserSchema.safeParse({ active: false, reason: 'Motivo fictício' }).success).toBe(true);
  });
});
