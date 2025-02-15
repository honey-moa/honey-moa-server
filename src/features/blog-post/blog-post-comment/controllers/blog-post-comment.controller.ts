import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { User } from '@libs/api/decorators/user.decorator';
import { AggregateID } from '@libs/ddd/entity.base';
import { CreateBlogPostCommentRequestBodyDto } from '@features/blog-post/blog-post-comment/dtos/request/create-blog-post-comment.request-body-dto';
import { CreateBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/create-blog-post-comment/create-blog-post-comment.command';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { ApiBlogPostComment } from '@features/blog-post/blog-post-comment/controllers/blog-post-comment.swagger';
import { SetPagination } from '@libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@libs/guards/types/guard.constant';
import { FindBlogPostCommentsRequestQueryDto } from '@features/blog-post/blog-post-comment/dtos/request/find-blog-comments.request-query-dto';
import { FindBlogPostCommentsQuery } from '@features/blog-post/blog-post-comment/queries/find-blog-post-comments/find-blog-post-comments.query';
import { HandlerReturnType } from '@libs/types/type';
import { FindBlogPostCommentsQueryHandler } from '@features/blog-post/blog-post-comment/queries/find-blog-post-comments/find-blog-post-comments.query-handler';
import { BlogPostCommentResponseDto } from '@features/blog-post/blog-post-comment/dtos/response/blog-post-comment.response-dto';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';

@ApiTags('BlogPostComment')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogPostCommentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @ApiBlogPostComment.FindBlogPostComments({
    summary: '블로그 게시글 댓글 Pagination 조회 API',
    description:
      '토큰을 보내도 되고 안보내도 됨.<br>' +
      'private한 게시글 댓글 조회의 경우 토큰 값이 없거나 커넥션에 속하지 않으면 에러 처리',
  })
  @SetPagination()
  @SetGuardType(GuardType.OPTIONAL)
  @Get(routesV1.blogPostComment.findBlogPostComments)
  async findBlogPostComments(
    @User('sub') userId: AggregateID | null,
    @Param('id', ParsePositiveBigIntPipe) blogPostId: string,
    @Query() requestQueryDto: FindBlogPostCommentsRequestQueryDto,
  ) {
    const query = new FindBlogPostCommentsQuery({
      userId,
      blogPostId: BigInt(blogPostId),
      ...requestQueryDto,
    });

    const { blogPostComments, count } = await this.queryBus.execute<
      FindBlogPostCommentsQuery,
      HandlerReturnType<FindBlogPostCommentsQueryHandler>
    >(query);

    return [
      blogPostComments.map((blogPostComment) => {
        return new BlogPostCommentResponseDto({
          ...blogPostComment,
          user: new HydratedUserResponseDto(blogPostComment.user),
        });
      }),
      count,
    ];
  }
}
