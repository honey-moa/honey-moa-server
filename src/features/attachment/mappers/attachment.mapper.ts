import type { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentProps } from '@features/attachment/domain/attachment.entity-interface';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { baseSchema } from '@libs/db/base.schema';
import type { CreateEntityProps } from '@libs/ddd/entity.base';

export const attachmentSchema = baseSchema.extend({
  userId: z.bigint(),
  url: z.string().min(1).max(255),
  path: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(30),
  capacity: z.bigint(),
  uploadType: z.nativeEnum(AttachmentUploadType),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AttachmentModel = z.TypeOf<typeof attachmentSchema>;

@Injectable()
export class AttachmentMapper
  implements Omit<Mapper<AttachmentEntity, AttachmentModel>, 'toResponseDto'>
{
  toEntity(record: AttachmentModel): AttachmentEntity {
    const attachmentProps: CreateEntityProps<AttachmentProps> = {
      id: record.id,
      props: {
        userId: record.userId,
        location: new Location({
          url: record.url,
          path: record.path,
        }),
        mimeType: record.mimeType,
        capacity: record.capacity,
        uploadType: record.uploadType,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new AttachmentEntity(attachmentProps);
  }

  toPersistence(entity: AttachmentEntity): AttachmentModel {
    const props = entity.getProps();

    const record: AttachmentModel = {
      id: props.id,
      userId: props.userId,
      url: props.location.url,
      path: props.location.path,
      mimeType: props.mimeType,
      capacity: props.capacity,
      uploadType: props.uploadType,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };

    return attachmentSchema.parse(record);
  }
}
