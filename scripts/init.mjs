import { randomUUID } from 'node:crypto';
import { createDatabase } from '@smartschool/database';
import { FileStorage, storageConfigFromEnv } from '@smartschool/storage';
const db = createDatabase(process.env.DATABASE_URL);
const storage = new FileStorage(storageConfigFromEnv(process.env));
try {
  await db.foundationState.upsert({ where: { key: 'local-environment' }, update: {}, create: { key: 'local-environment', token: randomUUID() } });
  await storage.initialize();
  console.log('Fundação inicializada: marcador persistente e arquivo fictício privado. Dados existentes preservados.');
} finally { await db.$disconnect(); storage.close(); }
