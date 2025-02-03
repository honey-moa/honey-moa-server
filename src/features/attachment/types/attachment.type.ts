import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { ValueOf } from '@libs/types/type';

export type AttachmentUploadTypeUnion = ValueOf<typeof AttachmentUploadType>;
