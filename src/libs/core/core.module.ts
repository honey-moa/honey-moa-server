import { Module } from '@nestjs/common';
import { AppConfigModule } from '@libs/core/app-config/app-config.module';
import { PrismaModule } from '@libs/core/prisma/prisma.module';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
export class CoreModule {}
