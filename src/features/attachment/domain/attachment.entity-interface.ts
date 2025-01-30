import { AggregateID } from '@libs/ddd/entity.base';

export interface AttachmentProps {
  userId: AggregateID;
  url: string;
  path: string;
  mimeType: string;
  capacity: bigint;
}

export interface CreateAttachmentProps {
  id: AggregateID;
  userId: AggregateID;
  url: string;
  path: string;
  mimeType: string;
  capacity: bigint;
}
