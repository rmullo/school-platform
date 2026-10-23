import { S3Client, HeadBucketCommand, CreateBucketCommand, HeadObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
export interface StorageConfig {
  endpoint: string; region: string; bucket: string; accessKey: string; secretKey: string;
}
export class FileStorage {
  private readonly client: S3Client;
  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint, region: config.region, forcePathStyle: true, maxAttempts: 1,
      credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
    });
  }
  async check() {
    await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }), { abortSignal: AbortSignal.timeout(2500) });
  }
  async initialize() {
    try { await this.check(); } catch (error) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) throw error;
      await this.client.send(new CreateBucketCommand({ Bucket: this.config.bucket }));
    }
    // No public ACL/policy is created.
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.config.bucket, Key: 'foundation/example.txt' }));
    } catch (error) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) throw error;
      await this.client.send(new PutObjectCommand({
        Bucket: this.config.bucket, Key: 'foundation/example.txt',
        Body: 'SmartSchool: arquivo fictício da MD-01.\n', ContentType: 'text/plain; charset=utf-8',
      }));
    }
  }
  async readExample() {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: 'foundation/example.txt' }));
    return result.Body?.transformToString();
  }
  async putPrivate(key: string, body: Uint8Array, contentType: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.config.bucket, Key: key, Body: body, ContentType: contentType, Metadata: { visibility: 'private' } }));
  }
  async readPrivate(key: string) {
    return this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }
  close() { this.client.destroy(); }
}
export function storageConfigFromEnv(env: NodeJS.ProcessEnv): StorageConfig {
  const required = (key: string) => { const value = env[key]; if (!value) throw new Error('Configuração ausente: ' + key); return value; };
  return { endpoint: required('S3_ENDPOINT'), region: required('S3_REGION'), bucket: required('S3_BUCKET'), accessKey: required('S3_ACCESS_KEY'), secretKey: required('S3_SECRET_KEY') };
}
