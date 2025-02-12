import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { FormDataRequest } from 'nestjs-form-data';
import { PatchUpdateBlogRequestBodyDto } from '@features/blog/dtos/request/patch-update-blog.request-body-dto';
import { PatchUpdateBlogCommand } from '@features/blog/commands/patch-update-blog/patch-update-blog.command';

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
  @FormDataRequest()
  @Post(routesV1.blog.create)
  async create(
    @User('sub') userId: AggregateID,
    @Body() requestBodyDto: CreateBlogRequestBodyDto,
  ): Promise<IdResponseDto> {
    const { backgroundImageFile, ...rest } = requestBodyDto;

    const command = new CreateBlogCommand({
      userId,
      ...rest,
      backgroundImageFile: backgroundImageFile
        ? {
            buffer: backgroundImageFile.buffer,
            mimeType: backgroundImageFile.mimeType,
            capacity: backgroundImageFile.size,
          }
        : null,
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
    @Param('id', ParsePositiveBigIntPipe) userId: string,
  ): Promise<BlogResponseDto> {
    const query = new FindOneBlogByUserIdQuery({ userId: BigInt(userId) });

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

  @ApiBlog.PatchUpdate({
    summary: '블로그 정보 PatchUpdate API',
  })
  @FormDataRequest()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(routesV1.blog.patchUpdate)
  async patchUpdate(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) blogId: string,
    @Body() requestBodyDto: PatchUpdateBlogRequestBodyDto,
  ): Promise<void> {
    const { backgroundImageFile, ...rest } = requestBodyDto;

    const command = new PatchUpdateBlogCommand({
      userId,
      blogId: BigInt(blogId),
      ...rest,
      backgroundImageFile: backgroundImageFile
        ? {
            mimeType: backgroundImageFile.mimeType,
            capacity: backgroundImageFile.size,
            buffer: backgroundImageFile.buffer,
          }
        : backgroundImageFile === null
          ? null
          : undefined,
    });

    await this.commandBus.execute(command);
  }
}
