import { PostContent } from '@features/post/domain/value-objects/post-content.value-object';
import { UserEntity } from '@features/user/domain/user.entity';
import { AggregateID } from '@libs/ddd/entity.base';

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
