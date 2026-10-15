import { z } from 'zod';
export const dependencySchema = z.enum(['available', 'unavailable']);
export const environmentStatusSchema = z.object({
  status: z.enum(['ready', 'degraded']),
  checkedAt: z.iso.datetime(),
  services: z.object({ database: dependencySchema, storage: dependencySchema }),
  installation: z.object({ id: z.uuid(), createdAt: z.iso.datetime() }).nullable(),
});
export type EnvironmentStatus = z.infer<typeof environmentStatusSchema>;
