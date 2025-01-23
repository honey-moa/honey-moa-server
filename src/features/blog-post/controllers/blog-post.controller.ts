import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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

@ApiTags('BlogPost')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class BlogPostController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
