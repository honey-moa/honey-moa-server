import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { FileProps } from '@libs/types/type';

export class UserProfileImagePathUpdatedDomainEvent extends DomainEvent {
  readonly profileImageFile:
    | (FileProps & {
        fileId: AggregateID;
        profileImagePath: string;
        attachmentUrl: string;
      })
    | null;
  readonly previousProfileImagePath: string | null;

  constructor(props: DomainEventProps<UserProfileImagePathUpdatedDomainEvent>) {
    super(props);

    const { profileImageFile, previousProfileImagePath } = props;

    this.profileImageFile = profileImageFile;
    this.previousProfileImagePath = previousProfileImagePath;
  }
}
