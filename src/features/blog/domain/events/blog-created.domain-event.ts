import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';
import { FileProps } from '@libs/types/type';

export class BlogCreatedDomainEvent extends DomainEvent {
  readonly backgroundImageFile:
    | (FileProps & {
        fileId: AggregateID;
        backgroundImagePath: string;
        attachmentUrl: string;
      })
    | null;
  readonly createdBy: AggregateID;

  constructor(props: DomainEventProps<BlogCreatedDomainEvent>) {
    super(props);

    const { backgroundImageFile, createdBy } = props;

    this.backgroundImageFile = backgroundImageFile;
    this.createdBy = createdBy;
  }
}
