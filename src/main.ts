import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BootstrapService } from '@src/bootstrap.service';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return String(this);
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface User {
      sub?: string;
      email?: string;
      password?: string;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const bootstrapService = app.get<BootstrapService>(BootstrapService);

  bootstrapService.setCors(app);
  bootstrapService.setLogger(app);
  bootstrapService.setHealthCheckApi(app);
  bootstrapService.setPathPrefix(app);
  bootstrapService.setSwagger(app);
  bootstrapService.setMiddleware(app);
  bootstrapService.setInterceptors(app);
  bootstrapService.setPipe(app);
  bootstrapService.setExceptionFilters(app);
  bootstrapService.setGuards(app);
  bootstrapService.setShutdownHooks(app);

  await bootstrapService.startingServer(app);
}
bootstrap();
