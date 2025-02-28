import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogPostUpdatedDomainEvent extends DomainEvent {
  readonly updatedProps: {
    contents?: {
      oldContents: Array<Record<string, any>>;
      newContents: Array<Record<string, any>>;
      fileUrls?: string[];
      blogPostAttachments?: BlogPostAttachmentEntity[];
    };
    tagNames?: string[];
  };
  readonly userId: AggregateID;

  constructor(props: DomainEventProps<BlogPostUpdatedDomainEvent>) {
    super(props);

    const { updatedProps, userId } = props;

    this.updatedProps = updatedProps;
    this.userId = userId;
  }
}
