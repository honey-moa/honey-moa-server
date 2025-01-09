import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { baseSchema } from '@src/libs/db/base.schema';
import { Mapper } from '@src/libs/ddd/mapper.interface';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { UserConnectionProps } from '@src/apis/user/domain/user-connection/user-connection.entity-interface';
import {
  CreateUserConnectionResponseDtoProps,
  UserConnectionResponseDto,
} from '@src/apis/user/dtos/user-connection/response/user-connection.response-dto';
import { HydratedUserResponseDto } from '@src/apis/user/dtos/response/hydrated-user.response-dto';

export const userConnectionSchema = baseSchema
  .extend({
    requesterId: z.bigint(),
    requestedId: z.bigint(),
    status: z.nativeEnum(UserConnectionStatus),
    deletedAt: z.preprocess(
      (val: any) => (val === null ? null : new Date(val)),
      z.nullable(z.date()),
    ),
  })
  .superRefine(({ requestedId, requesterId }, ctx) => {
    if (requestedId === requesterId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'requestedId and requesterId must be different.',
        path: ['requestedId', 'requesterId'],
      });
    }
  });

export type UserConnectionModel = z.TypeOf<typeof userConnectionSchema>;

@Injectable()
export class UserConnectionMapper
  implements
    Mapper<
      UserConnectionEntity,
      UserConnectionModel,
      UserConnectionResponseDto
    >
{
  toEntity(record: UserConnectionModel): UserConnectionEntity {
    const userConnectionProps: CreateEntityProps<UserConnectionProps> = {
      id: record.id,
      props: {
        requestedId: record.requestedId,
        requesterId: record.requesterId,
        status: record.status,
        deletedAt: record.deletedAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new UserConnectionEntity(userConnectionProps);
  }

  toPersistence(entity: UserConnectionEntity): UserConnectionModel {
    const props = entity.getProps();

    const record: UserConnectionModel = {
      ...props,
    };

    return userConnectionSchema.parse(record);
  }

  toResponseDto(entity: UserConnectionEntity): UserConnectionResponseDto {
    const { requestedUser, requesterUser, ...props } = entity.getProps();

    const createDtoProps: CreateUserConnectionResponseDtoProps = {
      ...props,
    };

    if (requestedUser) {
      createDtoProps.requested = new HydratedUserResponseDto(requestedUser);
    }

    if (requesterUser) {
      createDtoProps.requester = new HydratedUserResponseDto(requesterUser);
    }

    return new UserConnectionResponseDto(createDtoProps);
  }
}
