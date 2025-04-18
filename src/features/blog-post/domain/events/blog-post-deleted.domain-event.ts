import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class BlogPostDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<BlogPostDeletedDomainEvent>) {
    super(props);
  }
}
