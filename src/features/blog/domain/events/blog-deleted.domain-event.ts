import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class BlogDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<BlogDeletedDomainEvent>) {
    super(props);
  }
}
