import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class TestPrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(TestPrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    super.$on('error', (event) => {
      this.logger.verbose(event.target);
    });
    await this.$connect();
  }
}
