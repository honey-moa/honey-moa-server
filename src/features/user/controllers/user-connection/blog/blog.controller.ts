import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateBlogCommand } from '@features/user/commands/user-connection/blog/create-blog/create-blog.command';
import { ApiBlog } from '@features/user/controllers/user-connection/blog/blog.swagger';
import { CreateBlogRequestBodyDto } from '@features/user/dtos/user-connection/blog/request/create-blog.request-body-dto';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';

@ApiTags('Blog')
@Controller(routesV1.version)
export class BlogController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiBlog.Create({
    summary: '블로그 생성 API',
  })
  @Post(routesV1.user.userConnection.blog.create)
  async create(
    @User('sub') userId: AggregateID,
    @Param('id') connectionId: string,
    @Body() requestBodyDto: CreateBlogRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateBlogCommand({
      userId,
      connectionId: BigInt(connectionId),
      ...requestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreateBlogCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }
}
