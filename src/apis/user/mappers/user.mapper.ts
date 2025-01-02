import type { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  UserLoginType,
  UserMbti,
  UserRole,
} from '@src/apis/user/types/user.constant';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import type { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import { baseSchema } from '@src/libs/db/base.schema';
import type { UserProps } from '@src/apis/user/domain/user.entity-interface';
import {
  UserEmailVerifyTokenMapper,
  userEmailVerifyTokenSchema,
} from '@src/apis/user/mappers/user-email-verify-token.mapper';

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

export const userWithUserEmailVerifyTokenSchema = userSchema.extend({
  userEmailVerifyToken: z.nullable(userEmailVerifyTokenSchema).optional(),
});

export type UserModel = z.TypeOf<typeof userSchema>;

type UserWithUserEmailVerifyTokenModel = z.TypeOf<
  typeof userWithUserEmailVerifyTokenSchema
>;

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  constructor(
    private readonly userEmailVerifyTokenMapper: UserEmailVerifyTokenMapper,
  ) {}

  toEntity(record: UserWithUserEmailVerifyTokenModel): UserEntity {
    const userProps: CreateEntityProps<UserProps> = {
      id: record.id,
      props: {
        nickname: record.nickname,
        role: record.role,
        mbti: record.mbti,
        isEmailVerified: record.isEmailVerified,
        deletedAt: record.deletedAt,

        loginCredential: new LoginCredential({
          email: record.email,
          password: record.password,
          loginType: record.loginType,
        }),
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (record.userEmailVerifyToken) {
      userProps.props.userEmailVerifyToken =
        this.userEmailVerifyTokenMapper.toEntity(record.userEmailVerifyToken);
    }

    return new UserEntity(userProps);
  }

  toPersistence(entity: UserEntity): UserModel {
    // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    const { userEmailVerifyToken, loginCredential, ...props } =
      entity.getProps();

    const record: UserModel = {
      ...props,
      ...loginCredential.unpack(),
    };

    return userSchema.parse(record);
  }

  toResponseDto(entity: UserEntity): UserResponseDto {
    const props = entity.getProps();

    return new UserResponseDto({
      ...props,
      ...props.loginCredential.unpack(),
    });
  }
}
