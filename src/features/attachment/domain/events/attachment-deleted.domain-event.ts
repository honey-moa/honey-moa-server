import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class AttachmentDeletedDomainEvent extends DomainEvent {
  constructor(props: DomainEventProps<AttachmentDeletedDomainEvent>) {
    super(props);
  }
}
