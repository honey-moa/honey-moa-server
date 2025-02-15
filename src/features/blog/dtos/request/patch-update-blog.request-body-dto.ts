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
import { IsNullable } from '@libs/api/decorators/is-nullable.decorator';
import { Transform } from 'class-transformer';

export class PatchUpdateBlogRequestBodyDto extends PartialType(
  OmitType(CreateBlogRequestBodyDto, ['backgroundImageFile'] as const),
) {
  @ApiPropertyOptional({
    description:
      '블로그 배경 이미지 파일. empty string일 경우 null로 판단해 배경 사진을 아예 삭제함.',
  })
  @IsFile()
  @HasMimeType([...BlogEntity.BLOG_BACKGROUND_IMAGE_MIME_TYPE])
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX)
  @IsOptional()
  @IsNullable()
  @Transform(({ value }) => (value === '' ? null : value))
  backgroundImageFile?: MemoryStoredFile | null;
}
