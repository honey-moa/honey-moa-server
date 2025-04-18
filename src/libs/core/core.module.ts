import { AppConfigModule } from '@libs/core/app-config/app-config.module';
import { PrismaModule } from '@libs/core/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
export class CoreModule {}
