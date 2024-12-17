import { Module } from '@nestjs/common';
import { AppConfigModule } from '@src/libs/core/app-config/app-config.module';
import { PrismaModule } from '@src/libs/core/prisma/prisma.module';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
export class CoreModule {}
