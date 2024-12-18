import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreatePostCommand } from '@src/apis/post/commands/create-post/create-post.command';
import { ApiPost } from '@src/apis/post/controllers/post.swagger';
import { CreatePostRequestBodyDto } from '@src/apis/post/dtos/request/create-post.request-body-dto';
import { FindPostsRequestQueryDto } from '@src/apis/post/dtos/request/find-posts.request-query-dto';
import { PostResponseDto } from '@src/apis/post/dtos/response/post.response-dto';
import { PostMapper, PostModel } from '@src/apis/post/mappers/post.mapper';
import { FindPostsQuery } from '@src/apis/post/queries/find-posts/find-posts.query';
import { routesV1 } from '@src/configs/app.route';
import { GetUserId } from '@src/libs/api/decorators/get-user-id.decorator';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decroator';
import { GuardType } from '@src/libs/guards/types/guard.constant';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { PaginationBy } from '@src/libs/interceptors/pagination/types/pagination-interceptor.enum';
import { Paginated } from '@src/libs/types/type';

@ApiTags('Post')
@Controller(routesV1.version)
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly postMapper: PostMapper,
  ) {}

  @ApiPost.Create({ summary: '게시글 생성 API' })
  @Post(routesV1.post.root)
  async create(
    @GetUserId() userId: bigint,
    @Body() createPostRequestBodyDto: CreatePostRequestBodyDto,
  ) {
    const command = new CreatePostCommand({
      userId,
      ...createPostRequestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreatePostCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }

  @SetGuardType(GuardType.PUBLIC)
  @SetPagination(PaginationBy.Offset)
  @ApiPost.FindPosts({ summary: '게시글 조회(Pagination) API' })
  @Get(routesV1.post.root)
  async findPosts(
    @Query() findPostsRequestQueryDto: FindPostsRequestQueryDto,
  ): Promise<[PostResponseDto[], number]> {
    const query = new FindPostsQuery({
      ...findPostsRequestQueryDto,
    });

    const [records, recordCount] = await this.queryBus.execute<
      FindPostsQuery,
      Paginated<PostModel>
    >(query);

    return [
      records.map((record) =>
        this.postMapper.toResponseDto(this.postMapper.toEntity(record)),
      ),
      recordCount,
    ];
  }
}
