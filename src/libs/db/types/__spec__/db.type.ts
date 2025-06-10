import { TestPrismaService } from '@libs/core/prisma/__spec__/services/test-prisma.service';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

export type TestDB = TransactionHost<
  TransactionalAdapterPrisma<TestPrismaService>
>;
