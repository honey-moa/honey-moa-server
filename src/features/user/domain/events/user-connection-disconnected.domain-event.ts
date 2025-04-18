import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';

export class UserConnectionDisconnectedDomainEvent extends DomainEvent {
  readonly connectionId: AggregateID;

  constructor(props: DomainEventProps<UserConnectionDisconnectedDomainEvent>) {
    super(props);

    this.connectionId = props.connectionId;
  }
}
