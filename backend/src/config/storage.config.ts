import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.S3_REGION ?? 'us-east-1',
  bucket: process.env.S3_BUCKET ?? 'smartledger',
  accessKey: process.env.S3_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
  publicUrl: process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/smartledger',
}));
