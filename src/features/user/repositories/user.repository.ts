import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserVerifyTokenMapper } from '@features/user/mappers/user-verify-token.mapper';
import { UserMapper } from '@features/user/mappers/user.mapper';
import {
  UserInclude,
  UserRepositoryPort,
} from '@features/user/repositories/user.repository-port';
import { UserLoginTypeUnion } from '@features/user/types/user.type';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: UserMapper,
    private readonly userVerifyTokenMapper: UserVerifyTokenMapper,
    private readonly userConnectionMapper: UserConnectionMapper,
  ) {}

  async findOneById(
    id: AggregateID,
    include?: UserInclude,
  ): Promise<UserEntity | undefined> {
    const record = await this.txHost.tx.user.findUnique({
      where: { id, deletedAt: null },
      include,
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<UserEntity[]> {
    const record = await this.txHost.tx.user.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: UserEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.user.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: UserEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.user.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: UserEntity): Promise<UserEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.user.update({
      where: { id: record.id },
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
    return this.mapper.toEntity(updatedRecord);
  }

  async findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined> {
    const existUser = await this.txHost.tx.user.findFirst({
      where: {
        email,
        loginType,
        deletedAt: null,
      },
      include,
    });

    return existUser ? this.mapper.toEntity(existUser) : undefined;
  }

  async findByIds(
    ids: AggregateID[],
    include?: UserInclude,
  ): Promise<UserEntity[]> {
    const records = await this.txHost.tx.user.findMany({
      where: {
        id: {
          in: ids,
        },
        deletedAt: null,
      },
      include,
    });

    return records.map((record) => this.mapper.toEntity(record));
  }

  async findOneUserByIdAndConnectionId(
    id: AggregateID,
    userConnectionId: AggregateID,
    status?: UserConnectionStatusUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined> {
    const user = await this.txHost.tx.user.findUnique({
      where: {
        id,
        deletedAt: null,
        OR: [
          {
            requestedConnections: {
              some: {
                id: userConnectionId,
                status,
                deletedAt: null,
              },
            },
          },
          {
            requesterConnections: {
              some: {
                id: userConnectionId,
                status,
                deletedAt: null,
              },
            },
          },
        ],
      },
      include,
    });

    return user ? this.mapper.toEntity(user) : undefined;
  }

  async findOneUserConnectionByIdAndStatus(
    userConnectionId: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined> {
    const userConnection = await this.txHost.tx.userConnection.findUnique({
      where: {
        id: userConnectionId,
        status,
        deletedAt: null,
      },
    });

    return userConnection
      ? this.userConnectionMapper.toEntity(userConnection)
      : undefined;
  }

  async createUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void> {
    const record = this.userVerifyTokenMapper.toPersistence(entity);

    await this.txHost.tx.userVerifyToken.create({
      data: record,
    });
  }

  async updateUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void> {
    const record = this.userVerifyTokenMapper.toPersistence(entity);

    await this.txHost.tx.userVerifyToken.update({
      where: {
        id: record.id,
      },
      data: record,
    });
  }

  async createUserConnection(entity: UserConnectionEntity): Promise<void> {
    const record = this.userConnectionMapper.toPersistence(entity);

    await this.txHost.tx.userConnection.create({
      data: record,
    });
  }

  async updateUserConnection(
    entity: UserEntity,
    userConnection: UserConnectionEntity,
  ): Promise<void> {
    const record = this.userConnectionMapper.toPersistence(userConnection);

    await this.txHost.tx.userConnection.update({
      where: { id: record.id },
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }
}
