import type { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  UserLoginType,
  UserMbti,
  UserRole,
} from '@features/user/types/user.constant';
import { UserEntity } from '@features/user/domain/user.entity';
import type { CreateEntityProps } from '@libs/ddd/entity.base';
import { UserResponseDto } from '@features/user/dtos/response/user.response-dto';
import { baseSchema } from '@libs/db/base.schema';
import type { UserProps } from '@features/user/domain/user.entity-interface';
import {
  UserVerifyTokenMapper,
  userVerifyTokenSchema,
} from '@features/user/mappers/user-verify-token.mapper';
import { isNil } from '@libs/utils/util';
import {
  userConnectionSchema,
  UserConnectionMapper,
} from '@features/user/user-connection/mappers/user-connection.mapper';

export const userSchema = baseSchema.extend({
  nickname: z.string().min(1).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  loginType: z.nativeEnum(UserLoginType),
  role: z.nativeEnum(UserRole),
  isEmailVerified: z.boolean(),
  mbti: z.nativeEnum(UserMbti).nullable(),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export const userWithEntitiesTokensSchema = userSchema.extend({
  userVerifyTokens: z.array(userVerifyTokenSchema).optional(),
  requestedConnection: z.array(userConnectionSchema).optional(),
  requesterConnection: z.array(userConnectionSchema).optional(),
});

export type UserModel = z.TypeOf<typeof userSchema>;

type UserWithEntitiesTokensModel = z.TypeOf<
  typeof userWithEntitiesTokensSchema
>;

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  constructor(
    private readonly userVerifyTokenMapper: UserVerifyTokenMapper,
    private readonly userConnectionMapper: UserConnectionMapper,
  ) {}

  toEntity(record: UserWithEntitiesTokensModel): UserEntity {
    const userProps: CreateEntityProps<UserProps> = {
      id: record.id,
      props: {
        nickname: record.nickname,
        role: record.role,
        mbti: record.mbti,
        isEmailVerified: record.isEmailVerified,
        deletedAt: record.deletedAt,
        email: record.email,
        password: record.password,
        loginType: record.loginType,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (!isNil(record.userVerifyTokens)) {
      userProps.props.userVerifyTokens = record.userVerifyTokens.map((token) =>
        this.userVerifyTokenMapper.toEntity(token),
      );
    }

    if (!isNil(record.requestedConnection)) {
      userProps.props.requestedConnection = record.requestedConnection.map(
        (connection) => this.userConnectionMapper.toEntity(connection),
      );
    }

    if (!isNil(record.requesterConnection)) {
      userProps.props.requesterConnection = record.requesterConnection.map(
        (connection) => this.userConnectionMapper.toEntity(connection),
      );
    }

    return new UserEntity(userProps);
  }

  toPersistence(entity: UserEntity): UserModel {
    const {
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      userVerifyTokens,
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      requestedConnection,
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
      requesterConnection,
      ...props
    } = entity.getProps();

    const record: UserModel = {
      ...props,
    };

    return userSchema.parse(record);
  }

  toResponseDto(entity: UserEntity): UserResponseDto {
    const props = entity.getProps();

    return new UserResponseDto({
      ...props,
    });
  }
}
