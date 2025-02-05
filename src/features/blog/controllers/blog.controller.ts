import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { ApiBlog } from '@features/blog/controllers/blog.swagger';
import { CreateBlogRequestBodyDto } from '@features/blog/dtos/request/create-blog.request-body-dto';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { FindOneBlogByUserIdQuery } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query';
import { HandlerReturnType } from '@libs/types/type';
import { FindOneBlogByUserIdQueryHandler } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query-handler';
import { BlogResponseDto } from '@features/blog/dtos/response/blog.response-dto';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@libs/guards/types/guard.constant';

@ApiTags('Blog')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBlog.Create({
    summary: '블로그 생성 API',
  })
  @Post(routesV1.blog.create)
  async create(
    @User('sub') userId: AggregateID,
    @Body() requestBodyDto: CreateBlogRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateBlogCommand({
      userId,
      ...requestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreateBlogCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }

  @SetGuardType(GuardType.PUBLIC)
  @ApiBlog.FindOneByUserId({
    summary: '블로그 단일 조회 API',
    description:
      '유저의 ID를 통해 해당 유저의(해당 유저가 속한 커넥션의) 블로그를 조회',
  })
  @Get(routesV1.blog.findOneByUserId)
  async findOneByUserId(
    @Param('id') userId: AggregateID,
  ): Promise<BlogResponseDto> {
    const query = new FindOneBlogByUserIdQuery({ userId });

    const result = await this.queryBus.execute<
      FindOneBlogByUserIdQuery,
      HandlerReturnType<FindOneBlogByUserIdQueryHandler>
    >(query);

    return new BlogResponseDto({
      ...result,
      members: result.members.map(
        (member) => new HydratedUserResponseDto(member),
      ),
    });
  }
}
