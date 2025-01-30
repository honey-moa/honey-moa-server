import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentMapper } from '@features/attachment/mappers/attachment.mapper';

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

    return this.mapper.toEntity(updatedRecord);
  }
}
