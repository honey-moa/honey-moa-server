import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';

@Injectable()
export class UserConnectionRepository implements UserConnectionRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly mapper: UserConnectionMapper,
  ) {}

  async findOneById(
    id: AggregateID,
  ): Promise<UserConnectionEntity | undefined> {
    const record = await this.txHost.tx.userConnection.findUnique({
      where: { id, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<UserConnectionEntity[]> {
    const record = await this.txHost.tx.userConnection.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: UserConnectionEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.userConnection.delete({
      where: { id: entity.id },
    });

    return result.id;
  }

  async create(entity: UserConnectionEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.userConnection.create({
      data: record,
    });
  }

  async update(entity: UserConnectionEntity): Promise<UserConnectionEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.userConnection.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async findOneByIdAndStatus(
    id: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined> {
    const userConnection = await this.txHost.tx.userConnection.findUnique({
      where: {
        id,
        status,
        deletedAt: null,
      },
    });

    return userConnection ? this.mapper.toEntity(userConnection) : undefined;
  }

  async findOneByUserIdAndStatus(
    userId: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined> {
    const userConnection = await this.txHost.tx.userConnection.findFirst({
      where: {
        OR: [
          {
            requesterId: userId,
            status,
          },
          {
            requestedId: userId,
            status,
          },
        ],
        deletedAt: null,
      },
    });

    return userConnection ? this.mapper.toEntity(userConnection) : undefined;
  }
}
