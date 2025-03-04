import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { CreateEntityProps } from '@libs/ddd/entity.base';
import { baseSchema } from '@libs/db/base.schema';
import { Mapper } from '@libs/ddd/mapper.interface';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import { UserVerifyTokenProps } from '@features/user/domain/user-verify-token/user-verify-token.entity-interface';
import { UserVerifyTokenType } from '@features/user/types/user.constant';

export const userVerifyTokenSchema = baseSchema
  .extend({
    userId: z.bigint(),
    token: z.string().uuid(),
    type: z.nativeEnum(UserVerifyTokenType),
    expiresAt: z.date(),
    isUsed: z.boolean(),
  })
  .superRefine(({ createdAt, expiresAt }, ctx) => {
    if (
      expiresAt.getTime() <
      createdAt.getTime() + UserVerifyTokenEntity.VERIFICATION_EXPIRES_IN
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'expiresAt must be 1 hour greater than createdAt.',
        path: ['expiresAt'],
      });
    }
  });

export type UserVerifyTokenModel = z.TypeOf<typeof userVerifyTokenSchema>;

@Injectable()
export class UserVerifyTokenMapper
  implements
    Omit<
      Mapper<UserVerifyTokenEntity, UserVerifyTokenModel, unknown>,
      'toResponseDto'
    >
{
  toEntity(record: UserVerifyTokenModel): UserVerifyTokenEntity {
    const userVerifyTokenProps: CreateEntityProps<UserVerifyTokenProps> = {
      id: record.id,
      props: {
        userId: record.userId,
        token: record.token,
        type: record.type,
        isUsed: record.isUsed,
        expiresAt: record.expiresAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new UserVerifyTokenEntity(userVerifyTokenProps);
  }

  toPersistence(entity: UserVerifyTokenEntity): UserVerifyTokenModel {
    const props = entity.getProps();

    const record: UserVerifyTokenModel = {
      ...props,
    };

    return userVerifyTokenSchema.parse(record);
  }
}
