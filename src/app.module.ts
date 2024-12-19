import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BootstrapService } from '@src/bootstrap.service';
import { LibsModule } from '@src/libs/libs.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PrismaModule } from '@src/libs/core/prisma/prisma.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { ApisModule } from '@src/apis/apis.module';
import { RequestContextModule } from 'nestjs-request-context';
import { CqrsModule } from '@nestjs/cqrs';

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

    LibsModule,
    ApisModule,
  ],
  controllers: [AppController],
  providers: [BootstrapService],
})
export class AppModule {}
