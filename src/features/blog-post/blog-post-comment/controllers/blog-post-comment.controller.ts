import { routesV1 } from '@config/app.route';
import { CreateBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/create-blog-post-comment/create-blog-post-comment.command';
import { DeleteBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/delete-blog-post-comment/delete-blog-post-comment.command';
import { PatchUpdateBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/patch-update-blog-post-comment/patch-update-blog-post-comment.command';
import { ApiBlogPostComment } from '@features/blog-post/blog-post-comment/controllers/blog-post-comment.swagger';
import { CreateBlogPostCommentRequestBodyDto } from '@features/blog-post/blog-post-comment/dtos/request/create-blog-post-comment.request-body-dto';
import { FindBlogPostCommentsRequestQueryDto } from '@features/blog-post/blog-post-comment/dtos/request/find-blog-comments.request-query-dto';
import { PatchUpdateBlogPostCommentRequestBodyDto } from '@features/blog-post/blog-post-comment/dtos/request/patch-update-blog-post-comment.request-body-dto';
import { BlogPostCommentResponseDto } from '@features/blog-post/blog-post-comment/dtos/response/blog-post-comment.response-dto';
import { FindBlogPostCommentsQuery } from '@features/blog-post/blog-post-comment/queries/find-blog-post-comments/find-blog-post-comments.query';
import { FindBlogPostCommentsQueryHandler } from '@features/blog-post/blog-post-comment/queries/find-blog-post-comments/find-blog-post-comments.query-handler';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { NotEmptyObjectPipe } from '@libs/api/pipes/not-empty-object.pipe';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@libs/ddd/entity.base';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@libs/guards/types/guard.constant';
import { SetPagination } from '@libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { HandlerReturnType } from '@libs/types/type';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

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

  @ApiBlogPostComment.PatchUpdate({
    summary: '블로그 게시글 댓글 PatchUpdate API',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(routesV1.blogPostComment.patchUpdate)
  async patchUpdate(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogPostId: string,
    @Param('blogPostCommentId', ParsePositiveBigIntPipe)
    blogPostCommentId: string,
    @Body(NotEmptyObjectPipe)
    requestBodyDto: PatchUpdateBlogPostCommentRequestBodyDto,
  ) {
    const command = new PatchUpdateBlogPostCommentCommand({
      userId,
      blogPostId: BigInt(blogPostId),
      blogPostCommentId: BigInt(blogPostCommentId),
      ...requestBodyDto,
    });

    await this.commandBus.execute<
      PatchUpdateBlogPostCommentCommand,
      AggregateID
    >(command);
  }

  @ApiBlogPostComment.Delete({
    summary: '블로그 게시글 댓글 삭제 API',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(routesV1.blogPostComment.delete)
  async delete(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogPostId: string,
    @Param('blogPostCommentId', ParsePositiveBigIntPipe)
    blogPostCommentId: string,
  ) {
    const command = new DeleteBlogPostCommentCommand({
      userId,
      blogPostId: BigInt(blogPostId),
      blogPostCommentId: BigInt(blogPostCommentId),
    });

    await this.commandBus.execute(command);
  }
}
