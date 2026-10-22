import { z } from 'zod';
export * from './school.js';
export * from './people.js';
export * from './commercial.js';
export const dependencySchema = z.enum(['available', 'unavailable']);
export const environmentStatusSchema = z.object({
  status: z.enum(['ready', 'degraded']),
  checkedAt: z.iso.datetime(),
  services: z.object({ database: dependencySchema, storage: dependencySchema }),
  installation: z.object({ id: z.uuid(), createdAt: z.iso.datetime() }).nullable(),
});
export type EnvironmentStatus = z.infer<typeof environmentStatusSchema>;

export const roleSchema = z.enum(['DIRECTOR', 'SECRETARY', 'IT']);
export const loginSchema = z.object({ email: z.email().max(254).transform(v => v.trim().toLowerCase()), password: z.string().min(1).max(128) }).strict();
export const createUserSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email().max(254).transform(v => v.trim().toLowerCase()), password: z.string().min(12).max(128), role: roleSchema }).strict();
export const changeUserSchema = z.object({ role: roleSchema.optional(), active: z.boolean().optional(), reason: z.string().trim().min(5).max(300) }).strict().refine(v => v.role !== undefined || v.active !== undefined);
export const reasonSchema = z.object({ reason: z.string().trim().min(5).max(300) }).strict();
export const publicUserSchema = z.object({ id: z.uuid(), name: z.string(), email: z.email(), role: roleSchema, active: z.boolean() });
export type PublicUser = z.infer<typeof publicUserSchema>;
export type Role = z.infer<typeof roleSchema>;
