import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class AttachmentDeletedDomainEvent extends DomainEvent {
  readonly path: string;

  constructor(props: DomainEventProps<AttachmentDeletedDomainEvent>) {
    super(props);

    this.path = props.path;
  }
}
