import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class BlogPostDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<BlogPostDeletedDomainEvent>) {
    super(props);
  }
}
