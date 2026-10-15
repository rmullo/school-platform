import { z } from 'zod';
const schema = z.object({
  DATABASE_URL: z.url().refine(v => v.startsWith('postgresql://') || v.startsWith('postgres://')),
  S3_ENDPOINT: z.url(), S3_REGION: z.string().min(1), S3_BUCKET: z.string().min(3),
  S3_ACCESS_KEY: z.string().min(1), S3_SECRET_KEY: z.string().min(8),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  WEB_ORIGIN: z.url(), LOG_LEVEL: z.enum(['debug','info','warn','error','silent']).default('info'),
});
export function readConfig(env: NodeJS.ProcessEnv) {
  const result = schema.safeParse(env);
  if (!result.success) throw new Error('Configuração inválida: ' + [...new Set(result.error.issues.map(i => i.path.join('.')))].join(', '));
  return result.data;
}
export type AppConfig = ReturnType<typeof readConfig>;
export const APP_CONFIG = Symbol('APP_CONFIG');
