import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { FILE_ARRAY_SIZE } from '@features/attachment/types/attachment.constant';
import { ArrayMaxSize, ArrayMinSize } from 'class-validator';
import {
  HasMimeType,
  IsFiles,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class CreateAttachmentRequestBodyDto {
  @IsFiles({
    each: true,
  })
  @HasMimeType([...AttachmentEntity.ATTACHMENT_MIME_TYPE], { each: true })
  @ArrayMinSize(FILE_ARRAY_SIZE.MIN)
  @ArrayMaxSize(FILE_ARRAY_SIZE.MAX)
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX, {
    each: true,
  })
  files: MemoryStoredFile[];
}
