import { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';
import { AggregateID } from '@libs/ddd/entity.base';

export interface AttachmentProps {
  userId: AggregateID;
  url: string;
  path: string;
  mimeType: string;
  capacity: bigint;
  uploadType: AttachmentUploadTypeUnion;
}

export interface CreateAttachmentProps {
  id: AggregateID;
  userId: AggregateID;
  url: string;
  path: string;
  mimeType: string;
  capacity: bigint;
  uploadType: AttachmentUploadTypeUnion;
}
