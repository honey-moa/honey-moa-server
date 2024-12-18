import { PostContent } from '@src/apis/post/domain/value-objects/post-content.value-object';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface PostProps {
  userId: AggregateID;

  deletedAt: Date | null;

  postContent: PostContent;

  user?: UserEntity;
}

export interface CreatePostProps {
  userId: AggregateID;

  postContent: PostContent;
}

export interface UpdatePostContentProps {
  title?: string;
  body?: string;
}
