import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateBlogRequestBodyDto } from '@features/blog/dtos/request/create-blog.request-body-dto';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { IsOptional } from 'class-validator';
import { BlogEntity } from '@features/blog/domain/blog.entity';

export class PatchUpdateBlogRequestBodyDto extends PartialType(
  OmitType(CreateBlogRequestBodyDto, ['backgroundImageFile'] as const),
) {
  @ApiPropertyOptional({
    description: '유저 프로필 이미지 파일',
  })
  @IsFile()
  @HasMimeType([...BlogEntity.BLOG_BACKGROUND_IMAGE_MIME_TYPE])
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX)
  @IsOptional()
  backgroundImageFile?: MemoryStoredFile;
}
