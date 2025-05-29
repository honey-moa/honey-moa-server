import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

export type DB = TransactionHost<TransactionalAdapterPrisma<PrismaService>>;
