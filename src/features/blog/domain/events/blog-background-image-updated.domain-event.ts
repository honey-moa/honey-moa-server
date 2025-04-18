import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';
import { FileProps } from '@libs/types/type';

export class BlogBackgroundImagePathUpdatedDomainEvent extends DomainEvent {
  readonly backgroundImageFile:
    | (FileProps & {
        fileId: AggregateID;
        backgroundImagePath: string;
        attachmentUrl: string;
      })
    | null;
  readonly previousBackgroundImagePath: string | null;
  readonly userId: AggregateID;

  constructor(
    props: DomainEventProps<BlogBackgroundImagePathUpdatedDomainEvent>,
  ) {
    super(props);

    const { backgroundImageFile, previousBackgroundImagePath, userId } = props;

    this.backgroundImageFile = backgroundImageFile;
    this.previousBackgroundImagePath = previousBackgroundImagePath;
    this.userId = userId;
  }
}
