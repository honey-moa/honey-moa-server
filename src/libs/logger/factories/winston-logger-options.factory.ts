import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import type { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import type { Key } from '@libs/core/app-config/types/app-config.type';
import { Inject, Injectable } from '@nestjs/common';
import {
  type WinstonModuleOptions,
  type WinstonModuleOptionsFactory,
  utilities,
} from 'nest-winston';
import winston from 'winston';
import WinstonCloudwatch from 'winston-cloudwatch';

@Injectable()
export class WinstonLoggerModuleOptionsFactory
  implements WinstonModuleOptionsFactory
{
  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      transports: [
        new winston.transports.Console({
          level: this.appConfigService.isLocal() ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.colorize({ level: true }), // 색깔 넣어서 출력
            winston.format.timestamp({
              format: '| YYYY-MM-DD HH:mm:ss.SSS |',
            }), // 시간 표시
            winston.format.errors({ stack: true }), // 에러 메시지 출력
            utilities.format.nestLike('Nest', {
              prettyPrint: true,
            }),
            winston.format.printf(
              ({ level, message, timestamp, stack, response }) => {
                return stack
                  ? response
                    ? `${timestamp} [${level}] ${message}\n${stack}\n ErrorResponseData : ${JSON.stringify(response)}`
                    : `${timestamp} [${level}] ${message}\n${stack}\n `
                  : `${timestamp} [${level}] ${message}`;
              },
            ), // 로그 포맷
          ),
        }),
        new WinstonCloudwatch({
          level: 'error',
          logGroupName: this.appConfigService.get<string>(
            ENV_KEY.CLOUDWATCH_AWS_LOG_GROUP_NAME,
          ),
          logStreamName: this.appConfigService.get<string>(
            ENV_KEY.CLOUDWATCH_AWS_LOG_STREAM_NAME,
          ),
          awsOptions: {
            credentials: {
              accessKeyId: this.appConfigService.get<string>(
                ENV_KEY.CLOUDWATCH_AWS_ACCESS_KEY_ID,
              ),
              secretAccessKey: this.appConfigService.get<string>(
                ENV_KEY.CLOUDWATCH_AWS_SECRET_ACCESS_KEY,
              ),
            },
            region: this.appConfigService.get<string>(
              ENV_KEY.CLOUDWATCH_AWS_REGION,
            ),
          },
          silent: this.appConfigService.isLocal(),
        }),
      ],
    };
  }
}
