import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { baseSchema } from '@src/libs/db/base.schema';
import { Mapper } from '@src/libs/ddd/mapper.interface';
import { UserEmailVerifyTokenEntity } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity';
import { UserEmailVerifyTokenProps } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity-interface';

export const userEmailVerifyTokenSchema = baseSchema
  .extend({
    userId: z.bigint(),
    token: z.string().uuid(),
    expiresAt: z.date(),
  })
  .superRefine(({ createdAt, expiresAt }, ctx) => {
    if (expiresAt.getTime() !== createdAt.getTime() + 60 * 60 * 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'expiresAt must be 1 hour greater than createdAt.',
        path: ['expiresAt'],
      });
    }
  });

export type UserEmailVerifyTokenModel = z.TypeOf<
  typeof userEmailVerifyTokenSchema
>;

@Injectable()
export class UserEmailVerifyTokenMapper
  implements
    Omit<
      Mapper<UserEmailVerifyTokenEntity, UserEmailVerifyTokenModel, unknown>,
      'toResponseDto'
    >
{
  toEntity(record: UserEmailVerifyTokenModel): UserEmailVerifyTokenEntity {
    const userEmailVerifyTokenProps: CreateEntityProps<UserEmailVerifyTokenProps> =
      {
        id: record.id,
        props: {
          userId: record.userId,
          token: record.token,
          expiresAt: record.expiresAt,
        },
        createdAt: record.createdAt,
      };

    return new UserEmailVerifyTokenEntity(userEmailVerifyTokenProps);
  }

  toPersistence(entity: UserEmailVerifyTokenEntity): UserEmailVerifyTokenModel {
    const props = entity.getProps();

    const record: UserEmailVerifyTokenModel = {
      ...props,
    };

    return userEmailVerifyTokenSchema.parse(record);
  }
}
