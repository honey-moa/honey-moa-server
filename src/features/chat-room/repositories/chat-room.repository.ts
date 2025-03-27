import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { ChatRoomMapper } from '@features/chat-room/mappers/chat-room.mapper';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';

@Injectable()
export class ChatRoomRepository implements ChatRoomRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: ChatRoomMapper,
    private readonly chatMessageMapper: ChatMessageMapper,
  ) {}

  async findOneById(id: AggregateID): Promise<ChatRoomEntity | undefined> {
    const record = await this.txHost.tx.chatRoom.findUnique({
      where: { id, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<ChatRoomEntity[]> {
    const record = await this.txHost.tx.chatRoom.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: ChatRoomEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.chatRoom.update({
      where: { id: entity.id },
      data: { deletedAt: new Date() },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: ChatRoomEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.chatRoom.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: ChatRoomEntity): Promise<ChatRoomEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.chatRoom.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<ChatRoomEntity | undefined> {
    const record = await this.txHost.tx.chatRoom.findFirst({
      where: { connectionId, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async createChatMessage(
    entity: ChatMessageEntity,
  ): Promise<ChatMessageResponseDto> {
    const record = this.chatMessageMapper.toPersistence(entity);

    const createdRecord = await this.txHost.tx.chatMessage.create({
      data: record,
    });

    const entityFromRecord = this.chatMessageMapper.toEntity(createdRecord);

    return this.chatMessageMapper.toResponseDto(entityFromRecord);
  }
}
