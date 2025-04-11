import { routesV1 } from '@config/app.route';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { PatchUpdateBlogCommand } from '@features/blog/commands/patch-update-blog/patch-update-blog.command';
import { ApiBlog } from '@features/blog/controllers/blog.swagger';
import {
  BlogAlreadyExistsError,
  CannotCreateBlogWithoutAcceptedConnectionError,
} from '@features/blog/domain/blog.errors';
import { CreateBlogRequestBodyDto } from '@features/blog/dtos/request/create-blog.request-body-dto';
import { PatchUpdateBlogRequestBodyDto } from '@features/blog/dtos/request/patch-update-blog.request-body-dto';
import { BlogResponseDto } from '@features/blog/dtos/response/blog.response-dto';
import { FindOneBlogByUserIdQuery } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query';
import { FindOneBlogByUserIdQueryHandler } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query-handler';
import { HydratedUserResponseDto } from '@features/user/dtos/response/hydrated-user.response-dto';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { NotEmptyObjectPipe } from '@libs/api/pipes/not-empty-object.pipe';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@libs/guards/types/guard.constant';
import { HandlerReturnType } from '@libs/types/type';
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
import { FormDataRequest } from 'nestjs-form-data';

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

    try {
      const result = await this.commandBus.execute<
        CreateBlogCommand,
        AggregateID
      >(command);

      return new IdResponseDto(result);
    } catch (err) {
      if (err instanceof CannotCreateBlogWithoutAcceptedConnectionError) {
        throw new HttpForbiddenException({
          code: err.code,
        });
      }

      if (err instanceof BlogAlreadyExistsError) {
        throw new HttpConflictException({
          code: err.code,
        });
      }

      throw err;
    }
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
      memberIds: result.memberIds,
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
    @Body(NotEmptyObjectPipe) requestBodyDto: PatchUpdateBlogRequestBodyDto,
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
