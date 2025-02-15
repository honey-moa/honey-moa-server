import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CreateBlogPostCommentRequestBodyDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '댓글 내용',
    minLength: BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MIN,
    maxLength: BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MAX,
  })
  @Length(
    BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MIN,
    BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MAX,
  )
  content: string;
}
