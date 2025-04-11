import { FeaturesModule } from '@features/features.module';
import { PrismaModule } from '@libs/core/prisma/prisma.module';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { LibsModule } from '@libs/libs.module';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BootstrapService } from '@src/bootstrap.service';
import { ClsModule } from 'nestjs-cls';
import { RequestContextModule } from 'nestjs-request-context';
import { AppController } from './app.controller';

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
