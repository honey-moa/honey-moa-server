import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserMbti } from '@features/user/types/user.constant';
import { UserMbtiUnion } from '@features/user/types/user.type';
import { IsNullable } from '@libs/api/decorators/is-nullable.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, Length } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class PatchUpdateUserRequestBodyDto {
  @ApiPropertyOptional({
    description: '유저 닉네임',
  })
  @IsOptional()
  @Length(1, 20)
  nickname?: string;

  @ApiPropertyOptional({
    description: '유저 MBTI',
    enum: UserMbti,
  })
  @IsOptional()
  @IsEnum(UserMbti)
  mbti?: UserMbtiUnion;

  @ApiPropertyOptional({
    description:
      '유저 프로필 이미지 파일. empty string을 보낼 경우 null로 판단해 프로필 이미지를 아예 삭제함.',
    nullable: true,
  })
  @IsFile()
  @HasMimeType([...UserEntity.USER_PROFILE_IMAGE_MIME_TYPE])
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX)
  @IsOptional()
  @IsNullable()
  @Transform(({ value }) => (value === '' ? null : value))
  profileImageFile?: MemoryStoredFile | null;
}
