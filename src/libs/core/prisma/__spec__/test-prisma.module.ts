import { TestPrismaService } from '@libs/core/prisma/__spec__/services/test-prisma.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [TestPrismaService],
  exports: [TestPrismaService],
})
export class TestPrismaModule {}
