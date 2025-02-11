import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserConnectionDisconnectedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<UserConnectionDisconnectedDomainEvent>) {
    super(props);
  }
}
