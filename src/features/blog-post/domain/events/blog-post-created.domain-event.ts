import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogPostCreatedDomainEvent extends DomainEvent {
  readonly userId: AggregateID;
  readonly title: string;
  readonly blogId: AggregateID;

  constructor(props: DomainEventProps<BlogPostCreatedDomainEvent>) {
    super(props);

    const { userId, title, blogId } = props;

    this.userId = userId;
    this.title = title;
    this.blogId = blogId;
  }
}
