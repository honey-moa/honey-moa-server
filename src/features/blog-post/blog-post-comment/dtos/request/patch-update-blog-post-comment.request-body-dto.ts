import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class PatchUpdateBlogPostCommentRequestBodyDto {
  @ApiPropertyOptional({
    description: '수정할 블로그 게시글 댓글 내용',
    minLength: BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MIN,
    maxLength: BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MAX,
  })
  @IsOptional()
  @Length(
    BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MIN,
    BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MAX,
  )
  content?: string;
}
