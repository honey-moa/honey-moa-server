import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { IsNullable } from '@libs/api/decorators/is-nullable.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, Length, MaxLength } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class CreateBlogRequestBodyDto {
  @ApiProperty({
    description: '블로그 이름',
    minLength: 1,
    maxLength: 30,
  })
  @Length(1, 30)
  name: string;

  @ApiProperty({
    description: '블로그 설명',
    minLength: 1,
    maxLength: 255,
  })
  @Length(1, 255)
  description: string;

  @ApiProperty({
    description: '블로그 시작일. 시간 제외 날짜 값까지만 허용. ex)2025-02-06',
    format: 'date',
    maxLength: 10,
  })
  @IsDateString()
  @MaxLength(10)
  dDayStartDate: string;

  @ApiProperty({
    description: '블로그 배경 이미지 파일',
    nullable: true,
    default: null,
  })
  @IsFile()
  @HasMimeType([...BlogEntity.BLOG_BACKGROUND_IMAGE_MIME_TYPE])
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX)
  @IsNullable()
  @Transform(({ value }) => (value ? value : null))
  backgroundImageFile: MemoryStoredFile | null = null;
}
