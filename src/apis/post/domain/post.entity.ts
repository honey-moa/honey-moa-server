import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import { getTsid } from 'tsid-ts';
import { config } from 'dotenv';
import {
  CreatePostProps,
  PostProps,
  UpdatePostContentProps,
} from '@src/apis/post/domain/post.entity-interface';
import { PostCreatedDomainEvent } from '@src/apis/post/domain/events/post-created.event';
import { PostContent } from '@src/apis/post/domain/value-objects/post-content.value-object';

config();

export class PostEntity extends AggregateRoot<PostProps> {
  static create(create: CreatePostProps): PostEntity {
    const id = getTsid().toBigInt();

    const props: PostProps = {
      ...create,
      deletedAt: null,
    };

    const post = new PostEntity({ id, props });

    post.addEvent(
      new PostCreatedDomainEvent({
        aggregateId: id,
        userId: props.userId,
        ...props.postContent.unpack(),
      }),
    );

    return post;
  }

  updatePostContent(props: UpdatePostContentProps) {
    const newPostContent = new PostContent({
      ...this.props.postContent.unpack(),
      ...props,
    });

    this.props.postContent = newPostContent;
  }

  public validate(): void {}
}
