import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import mailConfig from './mail.config';
import googleConfig from './google.config';
import redisConfig from './redis.config';
import storageConfig from './storage.config';
import aiConfig from './ai.config';

/**
 * Centralized environment configuration with validation.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        googleConfig,
        redisConfig,
        storageConfig,
        aiConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppConfigModule {}
