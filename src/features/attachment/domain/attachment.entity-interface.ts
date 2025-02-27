import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';
import { AggregateID } from '@libs/ddd/entity.base';

export interface AttachmentProps {
  userId: AggregateID;
  location: Location;
  mimeType: string;
  capacity: bigint;
  uploadType: AttachmentUploadTypeUnion;
}

export interface CreateAttachmentProps {
  userId: AggregateID;
  mimeType: string;
  capacity: bigint;
  uploadType: AttachmentUploadTypeUnion;
  path?: string;
  id?: AggregateID;
  url?: string;
}
