import { CreateBlogPostRequestBodyDto } from '@features/blog-post/dtos/request/create-blog-post.request-body-dto';
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PatchUpdateBlogPostRequestBodyDto extends PartialType(
  OmitType(CreateBlogPostRequestBodyDto, ['isPublic'] as const),
) {
  @ApiPropertyOptional({
    description: '해당 게시글 공개 여부',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
