import type { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { CreateEntityProps } from '@libs/ddd/entity.base';
import { baseSchema } from '@libs/db/base.schema';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentProps } from '@features/attachment/domain/attachment.entity-interface';
import { AttachmentResponseDto } from '@features/attachment/dtos/response/attachment.response-dto';

export const attachmentSchema = baseSchema.extend({
  userId: z.bigint(),
  url: z.string().min(1).max(255),
  path: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(30),
  capacity: z.bigint(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AttachmentModel = z.TypeOf<typeof attachmentSchema>;

@Injectable()
export class AttachmentMapper
  implements Mapper<AttachmentEntity, AttachmentModel, AttachmentResponseDto>
{
  toEntity(record: AttachmentModel): AttachmentEntity {
    const attachmentProps: CreateEntityProps<AttachmentProps> = {
      id: record.id,
      props: {
        userId: record.userId,
        url: record.url,
        path: record.path,
        mimeType: record.mimeType,
        capacity: record.capacity,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new AttachmentEntity(attachmentProps);
  }

  toPersistence(entity: AttachmentEntity): AttachmentModel {
    const props = entity.getProps();

    return attachmentSchema.parse(props);
  }

  toResponseDto(entity: AttachmentEntity): AttachmentResponseDto {
    const props = entity.getProps();

    return new AttachmentResponseDto(props);
  }
}
