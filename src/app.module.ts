import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BootstrapService } from '@src/bootstrap.service';
import { LibsModule } from '@libs/libs.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PrismaModule } from '@libs/core/prisma/prisma.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { RequestContextModule } from 'nestjs-request-context';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FeaturesModule } from '@features/features.module';

@Module({
  imports: [
    RequestContextModule,
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
      global: true,
      middleware: {
        mount: true,
      },
    }),
    CqrsModule.forRoot(),
    EventEmitterModule.forRoot(),

    LibsModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [BootstrapService],
})
export class AppModule {}
