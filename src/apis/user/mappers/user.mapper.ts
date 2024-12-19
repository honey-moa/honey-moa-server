import { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { UserLoginType, UserRole } from '@src/apis/user/types/user.constant';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserProps } from '@src/apis/user/domain/user.entity-interface';
import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import { baseSchema } from '@src/libs/db/base.schema';

export const userSchema = baseSchema.extend({
  name: z.string().min(1).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  loginType: z.enum([UserLoginType.EMAIL]),
  role: z.enum([UserRole.ADMIN, UserRole.USER]),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type UserModel = z.TypeOf<typeof userSchema>;

@Injectable()
export class UserMapper
  implements Mapper<UserEntity, UserModel, UserResponseDto>
{
  toEntity(record: UserModel): UserEntity {
    const userProps: CreateEntityProps<UserProps> = {
      id: record.id,
      props: {
        name: record.name,
        role: record.role,
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

    return new UserEntity(userProps);
  }

  toPersistence(entity: UserEntity): UserModel {
    const { loginCredential, ...props } = entity.getProps();

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
