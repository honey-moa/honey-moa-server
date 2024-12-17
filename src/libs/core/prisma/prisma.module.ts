import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
