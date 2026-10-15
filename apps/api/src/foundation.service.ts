import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { createDatabase, type Database } from '@smartschool/database';
import { FileStorage } from '@smartschool/storage';
import type { EnvironmentStatus } from '@smartschool/contracts';
import { APP_CONFIG, type AppConfig } from './config.js';
@Injectable()
export class FoundationService implements OnApplicationShutdown {
  readonly database: Database;
  readonly storage;
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.database = createDatabase(config.DATABASE_URL);
    this.storage = new FileStorage({ endpoint: config.S3_ENDPOINT, region: config.S3_REGION, bucket: config.S3_BUCKET, accessKey: config.S3_ACCESS_KEY, secretKey: config.S3_SECRET_KEY });
  }
  async status(): Promise<EnvironmentStatus> {
    const [db, files] = await Promise.allSettled([
      this.database.foundationState.findUniqueOrThrow({ where: { key: 'local-environment' } }),
      this.storage.check(),
    ]);
    return {
      status: db.status === 'fulfilled' && files.status === 'fulfilled' ? 'ready' : 'degraded',
      checkedAt: new Date().toISOString(),
      services: { database: db.status === 'fulfilled' ? 'available' : 'unavailable', storage: files.status === 'fulfilled' ? 'available' : 'unavailable' },
      installation: db.status === 'fulfilled' ? { id: db.value.token, createdAt: db.value.createdAt.toISOString() } : null,
    };
  }
  async onApplicationShutdown() { this.storage.close(); await this.database.$disconnect(); }
}
