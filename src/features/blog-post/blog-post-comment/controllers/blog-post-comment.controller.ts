import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '@libs/api/decorators/user.decorator';
import { AggregateID } from '@libs/ddd/entity.base';
import { CreateBlogPostCommentRequestBodyDto } from '@features/blog-post/blog-post-comment/dtos/request/create-blog-post-comment.request-body-dto';
import { CreateBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/create-blog-post-comment/create-blog-post-comment.command';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { ApiBlogPostComment } from '@features/blog-post/blog-post-comment/controllers/blog-post-comment.swagger';

@ApiTags('BlogPostComment')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogPostCommentController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiBlogPostComment.Create({
    summary: '블로그 게시글 댓글 생성',
    description:
      '이메일 인증된 사용자만 댓글 작성할 수 있음.<br>' +
      '게시글이 private한 게시글일 경우 커넥션에 속해 있지 않으면 에러',
  })
  @Post(routesV1.blogPostComment.create)
  async create(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogPostId: string,
    @Body() requestBodyDto: CreateBlogPostCommentRequestBodyDto,
  ) {
    const command = new CreateBlogPostCommentCommand({
      userId,
      blogPostId: BigInt(blogPostId),
      ...requestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreateBlogPostCommentCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }
}
