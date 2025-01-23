import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { ApiBlog } from '@features/blog/controllers/blog.swagger';
import { CreateBlogRequestBodyDto } from '@features/blog/dtos/request/create-blog.request-body-dto';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';

@ApiTags('Blog')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
