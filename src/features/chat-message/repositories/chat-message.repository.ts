import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { ChatMessageRepositoryPort } from '@features/chat-message/repositories/chat-message.repository-port';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatMessageRepository implements ChatMessageRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: ChatMessageMapper,
  ) {}

  async create(entity: ChatMessageEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.chatMessage.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async findOneById(id: AggregateID): Promise<ChatMessageEntity | undefined> {
    const record = await this.txHost.tx.chatMessage.findUnique({
      where: { id, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<ChatMessageEntity[]> {
    const record = await this.txHost.tx.chatMessage.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: ChatMessageEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.chatMessage.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async update(entity: ChatMessageEntity): Promise<ChatMessageEntity> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.chatMessage.update({
      where: { id: entity.id },
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);

    return this.mapper.toEntity(updatedRecord);
  }
}
