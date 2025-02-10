import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserConnectionDisconnectDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<UserConnectionDisconnectDomainEvent>) {
    super(props);
  }
}
