import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TestPrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(TestPrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}
