import { Inject, Injectable } from '@nestjs/common';
import { ENV_KEY } from '@src/libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@src/libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@src/libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@src/libs/core/app-config/types/app-config.type';
import {
  utilities,
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
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
          level: 'info',
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
                  ? (response as any)?.data
                    ? `${timestamp} [${level}] ${message}\n${stack}\n ErrorResponseData : ${JSON.stringify((response as any).data)}`
                    : `${timestamp} [${level}] ${message}\n${stack}`
                  : `${timestamp} [${level}] ${message}`;
              },
            ), // 로그 포맷
          ),
        }),
        new WinstonCloudwatch({
          level: 'warn',
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
