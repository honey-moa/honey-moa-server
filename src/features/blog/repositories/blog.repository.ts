import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { BlogMapper } from '@features/blog/mappers/blog.mapper';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';

@Injectable()
export class BlogRepository implements BlogRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: BlogMapper,
  ) {}

  async findOneById(id: AggregateID): Promise<BlogEntity | undefined> {
    const record = await this.txHost.tx.blog.findUnique({
      where: { id, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<BlogEntity[]> {
    const record = await this.txHost.tx.blog.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: BlogEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.blog.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: BlogEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blog.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: BlogEntity): Promise<BlogEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.blog.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<BlogEntity | undefined> {
    const record = await this.txHost.tx.blog.findFirst({
      where: {
        connectionId,
      },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async createBlog(entity: BlogEntity): Promise<void> {
    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blog.create({
      data: record,
    });
  }
}
