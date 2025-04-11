import { routesV1 } from '@config/app.route';
import { CreateBlogPostCommand } from '@features/blog-post/commands/create-blog-post/create-blog-post.command';
import { DeleteBlogPostCommand } from '@features/blog-post/commands/delete-blog-post/delete-blog-post.command';
import { PatchUpdateBlogPostCommand } from '@features/blog-post/commands/patch-update-blog-post/patch-update-blog-post.command';
import { ApiBlogPost } from '@features/blog-post/controllers/blog-post.swagger';
import { CreateBlogPostRequestBodyDto } from '@features/blog-post/dtos/request/create-blog-post.request-body-dto';
import { FindBlogPostsFromBlogRequestQueryDto } from '@features/blog-post/dtos/request/find-blog-posts-from-blog.request-query-dto';
import { FindPublicBlogPostsRequestQueryDto } from '@features/blog-post/dtos/request/find-public-blog-posts.request-query-dto';
import { PatchUpdateBlogPostRequestBodyDto } from '@features/blog-post/dtos/request/patch-update-blog-post.request-body-dto';
import { BlogPostResponseDto } from '@features/blog-post/dtos/response/blog-post.response-dto';
import { FindBlogPostsFromBlogQuery } from '@features/blog-post/queries/find-blog-posts-from-blog/find-blog-posts-from-blog.query';
import { FindBlogPostsFromBlogQueryHandler } from '@features/blog-post/queries/find-blog-posts-from-blog/find-blog-posts-from-blog.query-handler';
import { FindOneBlogPostQuery } from '@features/blog-post/queries/find-one-blog-post/find-one-blog-post.query';
import { FindOneBlogPostQueryHandler } from '@features/blog-post/queries/find-one-blog-post/find-one-blog-post.query-handler';
import { FindPublicBlogPostsQuery } from '@features/blog-post/queries/find-public-blog-posts/find-public-blog-posts.query';
import { FindPublicBlogPostsQueryHandler } from '@features/blog-post/queries/find-public-blog-posts/find-public-blog-posts.query-handler';
import { NotABlogMemberError } from '@features/blog/domain/blog.errors';
import { HydratedBlogResponseDto } from '@features/blog/dtos/response/hydrated-blog.response-dto';
import { HydratedTagResponseDto } from '@features/tag/dtos/response/hydrated-tag.response-dto';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { NotEmptyObjectPipe } from '@libs/api/pipes/not-empty-object.pipe';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
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

@ApiTags('BlogPost')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogPostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBlogPost.Create({
    summary: '블로그 게시글 생성 API',
  })
  @Post(routesV1.blogPost.create)
  async create(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogId: string,
    @Body() requestBodyDto: CreateBlogPostRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateBlogPostCommand({
      userId,
      blogId: BigInt(blogId),
      ...requestBodyDto,
    });

    try {
      const result = await this.commandBus.execute<
        CreateBlogPostCommand,
        AggregateID
      >(command);

      return new IdResponseDto(result);
    } catch (err) {
      if (err instanceof NotABlogMemberError) {
        throw new HttpForbiddenException({
          code: err.code,
        });
      }

      throw err;
    }
  }

  @ApiBlogPost.FindBlogPostsFromBlog({
    summary: '블로그에서 블로그 게시글 조회 API(Pagination)',
    description:
      '토큰을 보내도 되고 안보내도 됨.<br>' +
      'private한 게시글 조회의 경우 토큰 값이 없거나 커넥션에 속하지 않으면 에러 처리',
  })
  @SetGuardType(GuardType.OPTIONAL)
  @SetPagination()
  @Get(routesV1.blogPost.findBlogPostsFromBlog)
  async findBlogPostsFromBlog(
    @User('sub') userId: AggregateID | null,
    @Param('id', ParsePositiveBigIntPipe) blogId: string,
    @Query() requestQueryDto: FindBlogPostsFromBlogRequestQueryDto,
  ) {
    const query = new FindBlogPostsFromBlogQuery({
      userId,
      blogId: BigInt(blogId),
      ...requestQueryDto,
    });

    const { blogPosts, count } = await this.queryBus.execute<
      FindBlogPostsFromBlogQuery,
      HandlerReturnType<FindBlogPostsFromBlogQueryHandler>
    >(query);

    return [
      blogPosts.map((blogPost) => {
        return new BlogPostResponseDto({
          ...blogPost,
          tags: blogPost.tags.map((tag) => new HydratedTagResponseDto(tag)),
        });
      }),
      count,
    ];
  }

  @ApiBlogPost.FindOne({
    summary: '블로그 게시글 단일 조회 API',
    description:
      '공개 게시글의 경우 커넥션에 상관 없이 조회 가능. <br>' +
      '비공개 게시글의 경우엔 커넥션에 속해 있지 않으면 403 에러 처리',
  })
  @Get(routesV1.blogPost.findOne)
  async findOne(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogPostId: string,
  ): Promise<BlogPostResponseDto> {
    const query = new FindOneBlogPostQuery({
      userId,
      blogPostId: BigInt(blogPostId),
    });

    const result = await this.queryBus.execute<
      FindOneBlogPostQuery,
      HandlerReturnType<FindOneBlogPostQueryHandler>
    >(query);

    return new BlogPostResponseDto({
      ...result,
      tags: result.tags.map((tag) => new HydratedTagResponseDto(tag)),
    });
  }

  @ApiBlogPost.FindPublicBlogPosts({
    summary: '공개된 게시글 Pagination 조회 API',
  })
  @SetPagination()
  @SetGuardType(GuardType.PUBLIC)
  @Get(routesV1.blogPost.findPublicBlogPosts)
  async findPublicBlogPosts(
    @Query() requestQueryDto: FindPublicBlogPostsRequestQueryDto,
  ) {
    const query = new FindPublicBlogPostsQuery(requestQueryDto);

    const { blogPosts, count } = await this.queryBus.execute<
      FindPublicBlogPostsQuery,
      HandlerReturnType<FindPublicBlogPostsQueryHandler>
    >(query);

    return [
      blogPosts.map((blogPost) => {
        return new BlogPostResponseDto({
          ...blogPost,
          tags: blogPost.tags.map((tag) => new HydratedTagResponseDto(tag)),
          blog: new HydratedBlogResponseDto({
            ...blogPost.blog,
            members: blogPost.blog.members.map(
              (member) => new HydratedUserResponseDto(member),
            ),
          }),
        });
      }),
      count,
    ];
  }

  @ApiBlogPost.PatchUpdate({
    summary: '게시글 PATCH update API',
    description:
      'tag값이 올 경우 기존 태그 삭제 후 새로 추가.<br>' +
      '커넥션에 속한 유저만 수정 가능',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(routesV1.blogPost.patchUpdate)
  async patchUpdate(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogId: string,
    @Param('blogPostId', ParsePositiveBigIntPipe) blogPostId: string,
    @Body(NotEmptyObjectPipe) requestBodyDto: PatchUpdateBlogPostRequestBodyDto,
  ) {
    const command = new PatchUpdateBlogPostCommand({
      ...requestBodyDto,
      blogId: BigInt(blogId),
      blogPostId: BigInt(blogPostId),
      userId,
    });
    try {
      await this.commandBus.execute<PatchUpdateBlogPostCommand, void>(command);
    } catch (err) {
      if (err instanceof NotABlogMemberError) {
        throw new HttpForbiddenException({
          code: err.code,
        });
      }

      throw err;
    }
  }

  @ApiBlogPost.Delete({
    summary: '블로그 게시글 삭제 API',
    description: '커넥션에 속한 유저만 삭제 가능',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(routesV1.blogPost.delete)
  async delete(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogId: string,
    @Param('blogPostId', ParsePositiveBigIntPipe) blogPostId: string,
  ) {
    const command = new DeleteBlogPostCommand({
      blogId: BigInt(blogId),
      blogPostId: BigInt(blogPostId),
      userId,
    });

    await this.commandBus.execute<DeleteBlogPostCommand, void>(command);
  }
}
