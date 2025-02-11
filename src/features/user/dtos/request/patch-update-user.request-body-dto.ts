import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserMbti } from '@features/user/types/user.constant';
import { UserMbtiUnion } from '@features/user/types/user.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
    description: '유저 프로필 이미지 파일',
  })
  @IsFile()
  @HasMimeType([...UserEntity.USER_PROFILE_IMAGE_MIME_TYPE])
  @MaxFileSize(AttachmentEntity.ATTACHMENT_CAPACITY_MAX)
  @IsOptional()
  profileImageFile?: MemoryStoredFile;
}
