import {
  ClassSerializerInterceptor,
  INestApplication,
  Injectable,
  Logger,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENV_KEY } from '@src/libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@src/libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@src/libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@src/libs/core/app-config/types/app-config.type';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpClientErrorExceptionFilter } from '@src/libs/exceptions/client-errors/filters/http-client-error.exception-filter';
import { HttpPathNotFoundExceptionFilter } from '@src/libs/exceptions/etc-errors/filters/http-path-not-found-exception.filter';
import { HttpInternalServerErrorExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-internal-server-error-exception.filter';
import { HttpProcessErrorExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-process-error-exception.filter';
import { HttpRemainderExceptionFilter } from '@src/libs/exceptions/server-errors/filters/http-remainder-exception.filter';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { JwtBearerAuthGuard } from '@src/libs/guards/providers/jwt-bearer-auth.guard';
import { ContextInterceptor } from '@src/libs/interceptors/context/context.interceptor';
import { PaginationInterceptor } from '@src/libs/interceptors/pagination/pagination.interceptor';
import { CustomValidationPipe } from '@src/libs/pipes/custom-validation.pipe';

import { singularize } from 'inflection';

@Injectable()
export class BootstrapService {
  setCors(app: INestApplication) {
    app.enableCors();
  }

  setLogger(app: INestApplication) {
    const logger = new Logger();

    app.useLogger(logger);
  }

  setPathPrefix(app: INestApplication) {
    app.setGlobalPrefix('api');
  }

  setInterceptors(app: INestApplication) {
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      app.get<PaginationInterceptor>(PaginationInterceptor),
      app.get<ContextInterceptor>(ContextInterceptor),
    );
  }

  setPipe(app: INestApplication) {
    const options: Omit<ValidationPipeOptions, 'exceptionFactory'> = {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    };

    const exceptionFactory = (validationErrors: ValidationError[]) => {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        errors: validationErrors.flatMap((validationError) => {
          return {
            property: validationError.property,
            value: validationError.value,
            reason: validationError.constraints
              ? Object.values(validationError.constraints)[0]
              : '',
          };
        }),
      });
    };

    app.useGlobalPipes(
      new CustomValidationPipe({
        ...options,
        exceptionFactory,
      }),
    );
  }

  setExceptionFilters(app: INestApplication) {
    app.useGlobalFilters(
      app.get(HttpProcessErrorExceptionFilter),
      app.get(HttpRemainderExceptionFilter),
      app.get(HttpInternalServerErrorExceptionFilter),
      app.get(HttpClientErrorExceptionFilter),
      app.get(HttpPathNotFoundExceptionFilter),
    );
  }

  setGuards(app: INestApplication) {
    app.useGlobalGuards(app.get(JwtBearerAuthGuard));
  }

  setSwagger(app: INestApplication) {
    const appConfigService = app.get<AppConfigServicePort<Key>>(
      APP_CONFIG_SERVICE_DI_TOKEN,
    );

    if (appConfigService.isProduction()) {
      return;
    }

    const DOMAIN = appConfigService.get<string>(ENV_KEY.DOMAIN);
    const JSON_PATH = 'api-docs-json';
    const YAML_PATH = 'api-docs-yaml';

    const config = new DocumentBuilder()
      .setTitle('NestJS Boilerplate')
      .setDescription(
        'NestJS Boilerplate API</br>' +
          `<a target="_black" href="${DOMAIN}/${JSON_PATH}">json document</a></br>` +
          `<a target="_black" href="${DOMAIN}/${YAML_PATH}">yaml document</a></br>`,
      )
      .setVersion('0.1')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '액세스 토큰',
        },
        'access-token',
      )
      .addBasicAuth({
        type: 'http',
        description: 'Username에 email',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => {
        const controllerName = singularize(
          controllerKey.replace(/Controller$/, ''),
        ).replace(/^(.)/, (matchStr) => matchStr.toLowerCase());

        return `${controllerName}_${methodKey}`;
      },
    });

    SwaggerModule.setup('api-docs', app, document, {
      jsonDocumentUrl: JSON_PATH,
      yamlDocumentUrl: YAML_PATH,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: (a: Map<any, any>, b: Map<any, any>) => {
          const order = {
            post: '0',
            get: '1',
            put: '2',
            patch: '3',
            delete: '4',
          };

          return order[a.get('method')].localeCompare(order[b.get('method')]);
        },
      },
    });
  }

  setShutdownHooks(app: INestApplication) {
    app.enableShutdownHooks();
  }

  async startingServer(app: INestApplication) {
    const appConfigService = app.get<AppConfigServicePort<Key>>(
      APP_CONFIG_SERVICE_DI_TOKEN,
    );

    const PORT = appConfigService.get<number>(ENV_KEY.PORT);

    await app.listen(PORT);

    console.info(`Server listening on port ${PORT}`);
  }
}
