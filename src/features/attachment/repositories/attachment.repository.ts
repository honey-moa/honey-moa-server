import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentMapper } from '@features/attachment/mappers/attachment.mapper';
import { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';

@Injectable()
export class AttachmentRepository implements AttachmentRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: AttachmentMapper,
  ) {}

  async findOneById(id: AggregateID): Promise<AttachmentEntity | undefined> {
    const record = await this.txHost.tx.attachment.findUnique({
      where: { id },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<AttachmentEntity[]> {
    const record = await this.txHost.tx.attachment.findMany();

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: AttachmentEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.attachment.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: AttachmentEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.attachment.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: AttachmentEntity): Promise<AttachmentEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.attachment.update({
      where: { id: record.id },
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);

    return this.mapper.toEntity(updatedRecord);
  }

  async bulkCreate(entities: AttachmentEntity[]): Promise<void> {
    if (!entities.length) {
      return;
    }

    const records = entities.map((entity) => {
      entity.validate();

      return this.mapper.toPersistence(entity);
    });

    await this.txHost.tx.attachment.createMany({
      data: records,
    });

    await Promise.all(
      entities.map((entity) => entity.publishEvents(this.eventEmitter)),
    );
  }

  async findByUrls(urls: string[]): Promise<AttachmentEntity[]> {
    if (!urls.length) {
      return [];
    }

    const records = await this.txHost.tx.attachment.findMany({
      where: {
        url: {
          in: urls,
        },
      },
    });

    return records.map(this.mapper.toEntity);
  }

  async findByIdsAndUploadType(
    ids: AggregateID[],
    uploadType?: AttachmentUploadTypeUnion,
  ): Promise<AttachmentEntity[]> {
    if (!ids.length) {
      return [];
    }

    const records = await this.txHost.tx.attachment.findMany({
      where: { id: { in: ids }, uploadType },
    });

    return records.map((record) => this.mapper.toEntity(record));
  }

  async bulkDelete(entities: AttachmentEntity[]): Promise<void> {
    if (!entities.length) {
      return;
    }

    const ids = entities.map((entity) => entity.id);

    await this.txHost.tx.attachment.deleteMany({
      where: { id: { in: ids } },
    });

    await Promise.all(
      entities.map((entity) => entity.publishEvents(this.eventEmitter)),
    );
  }
}
