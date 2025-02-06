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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiBlogPost } from '@features/blog-post/controllers/blog-post.swagger';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { CreateBlogPostRequestBodyDto } from '@features/blog-post/dtos/request/create-blog-post.request-body-dto';
import { CreateBlogPostCommand } from '@features/blog-post/commands/create-blog-post/create-blog-post.command';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { FindOneBlogPostQuery } from '@features/blog-post/queries/find-one-blog-post/find-one-blog-post.query';
import { FindOneBlogPostQueryHandler } from '@features/blog-post/queries/find-one-blog-post/find-one-blog-post.query-handler';
import { HandlerReturnType } from '@libs/types/type';
import { BlogPostResponseDto } from '@features/blog-post/dtos/response/blog-post.response-dto';
import { HydratedTagResponseDto } from '@features/tag/dtos/response/hydrated-tag.response-dto';
import { PatchUpdateBlogPostRequestBodyDto } from '@features/blog-post/dtos/request/patch-update-blog-post.request-body-dto';
import { PatchUpdateBlogPostCommand } from '@features/blog-post/commands/patch-update-blog-post/patch-update-blog-post.command';
import { DeleteBlogPostCommand } from '@features/blog-post/commands/delete-blog-post/delete-blog-post.command';

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

    const result = await this.commandBus.execute<
      CreateBlogPostCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
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
    @Body() requestBodyDto: PatchUpdateBlogPostRequestBodyDto,
  ) {
    const command = new PatchUpdateBlogPostCommand({
      ...requestBodyDto,
      blogId: BigInt(blogId),
      blogPostId: BigInt(blogPostId),
      userId,
    });

    await this.commandBus.execute<PatchUpdateBlogPostCommand, void>(command);
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
