import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { AggregateID, CreateEntityProps } from '@libs/ddd/entity.base';
import { baseSchema } from '@libs/db/base.schema';
import { Mapper } from '@libs/ddd/mapper.interface';
import { chatRoomSchema } from '@features/chat-room/mappers/chat-room.mapper';
import { blogSchema } from '@features/blog/mappers/blog.mapper';
import { HydratedUserResponseDto } from '@src/features/user/dtos/response/hydrated-user.response-dto';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import {
  CreateUserConnectionResponseDtoProps,
  UserConnectionResponseDto,
} from '@features/user/user-connection/dtos/response/user-connection.response-dto';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionProps } from '@features/user/user-connection/domain/user-connection.entity-interface';
import { isNil } from '@libs/utils/util';

export const userConnectionSchema = baseSchema.extend({
  requesterId: z.bigint(),
  requestedId: z.bigint(),
  status: z.nativeEnum(UserConnectionStatus),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

const userConnectionSuperRefine = (
  {
    requestedId,
    requesterId,
  }: { requestedId: AggregateID; requesterId: AggregateID },
  ctx: z.RefinementCtx,
) => {
  if (requestedId === requesterId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'requestedId and requesterId must be different.',
      path: ['requestedId', 'requesterId'],
    });
  }
};

export type UserConnectionModel = z.TypeOf<typeof userConnectionSchema>;

export const userConnectionWithEntitiesSchema = userConnectionSchema.extend({
  blog: z.nullable(blogSchema).optional(),
  chatRoom: z.nullable(chatRoomSchema).optional(),
});

export type UserConnectionWithEntitiesModel = z.TypeOf<
  typeof userConnectionWithEntitiesSchema
>;

@Injectable()
export class UserConnectionMapper
  implements
    Mapper<
      UserConnectionEntity,
      UserConnectionModel,
      UserConnectionResponseDto
    >
{
  toEntity(record: UserConnectionWithEntitiesModel): UserConnectionEntity {
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

    return userConnectionSchema
      .superRefine(userConnectionSuperRefine)
      .parse(record);
  }

  toResponseDto(entity: UserConnectionEntity): UserConnectionResponseDto {
    const { requestedUser, requesterUser, ...props } = entity.getProps();

    const createDtoProps: CreateUserConnectionResponseDtoProps = {
      ...props,
    };

    if (!isNil(requestedUser)) {
      createDtoProps.requested = new HydratedUserResponseDto({
        id: requestedUser.id,
        nickname: requestedUser.nickname,
        profileImageUrl: requestedUser.profileImageUrl,
        createdAt: requestedUser.createdAt,
        updatedAt: requestedUser.updatedAt,
      });
    }

    if (!isNil(requesterUser)) {
      createDtoProps.requester = new HydratedUserResponseDto({
        id: requesterUser.id,
        nickname: requesterUser.nickname,
        profileImageUrl: requesterUser.profileImageUrl,
        createdAt: requesterUser.createdAt,
        updatedAt: requesterUser.updatedAt,
      });
    }

    return new UserConnectionResponseDto(createDtoProps);
  }
}
