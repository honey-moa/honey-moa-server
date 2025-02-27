import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<UserDeletedDomainEvent>) {
    super(props);
  }
}
