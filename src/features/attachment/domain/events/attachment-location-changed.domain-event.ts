import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class AttachmentLocationChangedDomainEvent extends DomainEvent {
  readonly oldPath: string;
  readonly newPath: string;
  readonly oldUrl: string;
  readonly newUrl: string;

  constructor(props: DomainEventProps<AttachmentLocationChangedDomainEvent>) {
    super(props);

    const { oldPath, newPath, oldUrl, newUrl } = props;

    this.oldPath = oldPath;
    this.newPath = newPath;
    this.oldUrl = oldUrl;
    this.newUrl = newUrl;
  }
}
