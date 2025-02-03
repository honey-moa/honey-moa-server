import { Module } from '@nestjs/common';

import { S3Client } from '@aws-sdk/client-s3';

import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { S3_CLIENT_TOKEN, S3_SERVICE_TOKEN } from '@libs/s3/tokens/di.token';
import { S3Service } from '@libs/s3/services/s3.service';

@Module({
  providers: [
    {
      provide: S3_CLIENT_TOKEN,
      inject: [APP_CONFIG_SERVICE_DI_TOKEN],
      useFactory: (appConfigService: AppConfigServicePort<Key>) => {
        return new S3Client({
          region: appConfigService.get<string>(ENV_KEY.AWS_S3_REGION),
          credentials: {
            accessKeyId: appConfigService.get<string>(
              ENV_KEY.AWS_S3_ACCESS_KEY,
            ),
            secretAccessKey: appConfigService.get<string>(
              ENV_KEY.AWS_S3_SECRET_KEY,
            ),
          },
          maxAttempts: 3,
        });
      },
    },
    {
      provide: S3_SERVICE_TOKEN,
      useClass: S3Service,
    },
  ],
  exports: [S3_SERVICE_TOKEN],
})
export class S3Module {}
