import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { AggregateID, CreateEntityProps } from '@libs/ddd/entity.base';
import { baseSchema } from '@libs/db/base.schema';
import { Mapper } from '@libs/ddd/mapper.interface';
import { UserConnectionStatus } from '@features/user/types/user.constant';
import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';
import { UserConnectionProps } from '@features/user/domain/user-connection/user-connection.entity-interface';
import {
  CreateUserConnectionResponseDtoProps,
  UserConnectionResponseDto,
} from '@features/user/dtos/user-connection/response/user-connection.response-dto';
import {
  ChatRoomMapper,
  chatRoomSchema,
} from '@features/user/mappers/chat-room.mapper';
import { BlogMapper, blogSchema } from '@features/user/mappers/blog.mapper';
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

type UserConnectionWithEntitiesModel = z.TypeOf<
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
  constructor(
    private readonly chatRoomMapper: ChatRoomMapper,
    private readonly blogMapper: BlogMapper,
  ) {}

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

    if (!isNil(record.blog)) {
      userConnectionProps.props.blog = this.blogMapper.toEntity(record.blog);
    }

    if (!isNil(record.chatRoom)) {
      userConnectionProps.props.chatRoom = this.chatRoomMapper.toEntity(
        record.chatRoom,
      );
    }

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
    const { blog, chatRoom, ...props } = entity.getProps();

    const createDtoProps: CreateUserConnectionResponseDtoProps = {
      ...props,
    };

    if (blog) {
      createDtoProps.blog = this.blogMapper.toResponseDto(blog);
    }

    if (chatRoom) {
      createDtoProps.chatRoom = this.chatRoomMapper.toResponseDto(chatRoom);
    }

    return new UserConnectionResponseDto(createDtoProps);
  }
}
