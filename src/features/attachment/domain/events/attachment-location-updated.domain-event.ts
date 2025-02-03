import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class AttachmentLocationUpdatedDomainEvent extends DomainEvent {
  readonly path: string;
  readonly url: string;

  constructor(props: DomainEventProps<AttachmentLocationUpdatedDomainEvent>) {
    super(props);

    const { path, url } = props;

    this.path = path;
    this.url = url;
  }
}
