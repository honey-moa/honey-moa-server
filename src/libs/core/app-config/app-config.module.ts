import {
  Global,
  Inject,
  Module,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as Joi from 'joi';

import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { AppConfigService } from '@libs/core/app-config/services/app-config.service';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@libs/core/app-config/types/app-config.type';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        [ENV_KEY.PORT]: Joi.number().default(3000),
        [ENV_KEY.NODE_ENV]: Joi.string().required(),
        /**
         * @todo dns 적용하면 default 제거 및 required 로 변경
         */
        [ENV_KEY.DOMAIN]: Joi.string().default('http://localhost:3000'),

        [ENV_KEY.HASH_ROUND]: Joi.number().required(),

        [ENV_KEY.JWT_SECRET]: Joi.string().required(),
        [ENV_KEY.JWT_ACCESS_TOKEN_EXPIRES_IN]: Joi.string().required(),
        [ENV_KEY.JWT_REFRESH_TOKEN_EXPIRES_IN]: Joi.string().required(),

        [ENV_KEY.DATABASE_URL]: Joi.string().required(),

        [ENV_KEY.EMAIL_HOST]: Joi.string().required(),
        [ENV_KEY.EMAIL_PORT]: Joi.number().required(),
        [ENV_KEY.EMAIL_AUTH_USER]: Joi.string().required(),
        [ENV_KEY.EMAIL_AUTH_PASSWORD]: Joi.string().required(),

        [ENV_KEY.CLOUDWATCH_AWS_ACCESS_KEY_ID]: Joi.string().required(),
        [ENV_KEY.CLOUDWATCH_AWS_SECRET_ACCESS_KEY]: Joi.string().required(),
        [ENV_KEY.CLOUDWATCH_AWS_REGION]: Joi.string().required(),
        [ENV_KEY.CLOUDWATCH_AWS_LOG_GROUP_NAME]: Joi.string().required(),
        [ENV_KEY.CLOUDWATCH_AWS_LOG_STREAM_NAME]: Joi.string().required(),

        [ENV_KEY.AWS_S3_ACCESS_KEY]: Joi.string().required(),
        [ENV_KEY.AWS_S3_SECRET_KEY]: Joi.string().required(),
        [ENV_KEY.AWS_S3_REGION]: Joi.string().required(),
        [ENV_KEY.AWS_S3_BUCKET]: Joi.string().required(),
        [ENV_KEY.AWS_S3_BUCKET_URL]: Joi.string().required(),

        [ENV_KEY.USER_ATTACHMENT_URL]: Joi.string().required(),
        [ENV_KEY.USER_DEFAULT_PROFILE_IMAGE_PATH]: Joi.string().required(),

        [ENV_KEY.BLOG_ATTACHMENT_URL]: Joi.string().required(),

        [ENV_KEY.BLOG_POST_ATTACHMENT_URL]: Joi.string().required(),

        [ENV_KEY.ATTACHMENT_URL]: Joi.string().required(),
      }),
    }),
  ],
  providers: [
    ConfigService,
    { provide: APP_CONFIG_SERVICE_DI_TOKEN, useClass: AppConfigService },
  ],
  exports: [APP_CONFIG_SERVICE_DI_TOKEN],
})
export class AppConfigModule implements OnApplicationBootstrap {
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  onApplicationBootstrap() {
    console.info(this.appConfigService.getAllMap());
  }
}
