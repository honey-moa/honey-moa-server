import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PostEntity } from '@src/apis/post/domain/post.entity';
import { PostMapper } from '@src/apis/post/mappers/post.mapper';
import { PostRepositoryPort } from '@src/apis/post/repositories/post.repository-port';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { AggregateID } from '@src/libs/ddd/entity.base';

@Injectable()
export class PostRepository implements PostRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventBus: EventBus,
    private readonly mapper: PostMapper,
  ) {}

  async findOneById(id: bigint): Promise<PostEntity | undefined> {
    const record = await this.txHost.tx.post.findUnique({ where: { id } });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<PostEntity[]> {
    const record = await this.txHost.tx.post.findMany();

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: PostEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.post.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventBus);

    return result.id;
  }

  async create(entity: PostEntity): Promise<void> {
    const { user, ...record } = this.mapper.toPersistence(entity);

    await this.txHost.tx.post.create({
      data: record,
    });

    await entity.publishEvents(this.eventBus);
  }

  async update(entity: PostEntity): Promise<PostEntity> {
    const { user, ...record } = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.post.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }
}
