import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { TagRepositoryPort } from '@features/tag/repositories/tag.repository-port';
import { TagMapper } from '@features/tag/mappers/tag.mapper';
import { TagEntity } from '@features/tag/domain/tag.entity';

@Injectable()
export class TagRepository implements TagRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: TagMapper,
  ) {}

  async findOneById(id: AggregateID): Promise<TagEntity | undefined> {
    const record = await this.txHost.tx.tag.findUnique({
      where: { id },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<TagEntity[]> {
    const record = await this.txHost.tx.tag.findMany();

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: TagEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.tag.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: TagEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.tag.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: TagEntity): Promise<TagEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.tag.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async findByNames(names: string[]): Promise<TagEntity[]> {
    if (!names.length) {
      return [];
    }

    const record = await this.txHost.tx.tag.findMany({
      where: { name: { in: names } },
    });

    return record.map(this.mapper.toEntity);
  }

  async bulkCreate(entities: TagEntity[]): Promise<void> {
    if (!entities.length) {
      return;
    }

    const record = entities.map((entity) => this.mapper.toPersistence(entity));

    await this.txHost.tx.tag.createMany({ data: record });

    await Promise.all(
      entities.map((entity) => entity.publishEvents(this.eventEmitter)),
    );
  }
}
