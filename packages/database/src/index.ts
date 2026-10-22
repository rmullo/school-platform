import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.js';
export { Prisma } from './generated/client.js';
export function createDatabase(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 2000, query_timeout: 2000, max: 5 }),
  });
}
export type Database = ReturnType<typeof createDatabase>;
