import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class ChatRoomDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<ChatRoomDeletedDomainEvent>) {
    super(props);
  }
}
