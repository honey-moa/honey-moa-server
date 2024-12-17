import { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { baseSchema } from '@src/libs/db/base.schema';
import { PostEntity } from '@src/apis/post/domain/post.entity';
import { PostProps } from '@src/apis/post/domain/post.entity-interface';
import { PostContent } from '@src/apis/post/domain/value-objects/post-content.value-object';
import {
  CreatePostResponseDtoProps,
  PostResponseDto,
} from '@src/apis/post/dtos/response/post.response-dto';
import { UserMapper, userSchema } from '@src/apis/user/mappers/user.mapper';
import { isNil } from '@src/libs/utils/util';

const postSchema = baseSchema.extend({
  userId: z.bigint(),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),

  user: z.optional(userSchema),
});

export type PostModel = z.TypeOf<typeof postSchema>;

@Injectable()
export class PostMapper
  implements Mapper<PostEntity, PostModel, PostResponseDto>
{
  constructor(private readonly userMapper: UserMapper) {}

  toEntity(record: PostModel): PostEntity {
    const postProps: CreateEntityProps<PostProps> = {
      id: record.id,
      props: {
        userId: record.userId,
        deletedAt: record.deletedAt,

        postContent: new PostContent({
          title: record.title,
          body: record.body,
        }),
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (!isNil(record.user)) {
      postProps.props.user = this.userMapper.toEntity(record.user);
    }

    return new PostEntity(postProps);
  }

  toPersistence(entity: PostEntity): PostModel {
    const { user, postContent, ...props } = entity.getProps();

    const record: PostModel = {
      ...props,
      ...postContent.unpack(),
    };

    console.log(record);

    return postSchema.parse(record);
  }

  toResponseDto(entity: PostEntity): PostResponseDto {
    const { user, ...props } = entity.getProps();

    const createPostResponseDtoProps: CreatePostResponseDtoProps = {
      ...props,
      ...props.postContent.unpack(),
    };

    if (!isNil(user)) {
      createPostResponseDtoProps.user = this.userMapper.toResponseDto(user);
    }

    return new PostResponseDto({
      ...createPostResponseDtoProps,
    });
  }
}
