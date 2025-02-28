import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class BlogPostThumbnailImagePathUpdatedDomainEvent extends DomainEvent {
  readonly oldThumbnailImagePath: string | null;
  readonly newThumbnailImagePath: string | null;
  readonly attachmentUrl: string;
  readonly attachmentPath: string;

  constructor(
    props: DomainEventProps<BlogPostThumbnailImagePathUpdatedDomainEvent>,
  ) {
    super(props);

    const {
      oldThumbnailImagePath,
      newThumbnailImagePath,
      attachmentUrl,
      attachmentPath,
    } = props;

    this.oldThumbnailImagePath = oldThumbnailImagePath;
    this.newThumbnailImagePath = newThumbnailImagePath;
    this.attachmentUrl = attachmentUrl;
    this.attachmentPath = attachmentPath;
  }
}
