import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserConnectionMapper } from '@src/apis/user/mappers/user-connection.mapper';
import { UserVerifyTokenMapper } from '@src/apis/user/mappers/user-verify-token.mapper';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import {
  UserInclude,
  UserRepositoryPort,
} from '@src/apis/user/repositories/user.repository-port';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';
import { PrismaService } from '@src/libs/core/prisma/services/prisma.service';
import { AggregateID } from '@src/libs/ddd/entity.base';

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
      where: { id },
      include,
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<UserEntity[]> {
    const record = await this.txHost.tx.user.findMany();

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
      },
      include,
    });

    return records.map((record) => this.mapper.toEntity(record));
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
}
