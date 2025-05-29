import { PatchUpdateBlogCommand } from '@features/blog/commands/patch-update-blog/patch-update-blog.command';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(PatchUpdateBlogCommand)
export class PatchUpdateBlogCommandHandler
  implements ICommandHandler<PatchUpdateBlogCommand, void>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: PatchUpdateBlogCommand): Promise<void> {
    const {
      userId,
      blogId,
      backgroundImageFile,
      name,
      description,
      dDayStartDate,
    } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const updateFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(dDayStartDate && { dDayStartDate }),
    };

    blog.update(updateFields, userId);

    if (backgroundImageFile !== undefined) {
      this.deleteBackgroundImage(blog, userId);

      if (backgroundImageFile) {
        blog.updateBackgroundImage(backgroundImageFile, userId);
      }
    }

    await this.blogRepository.update(blog);
  }

  private deleteBackgroundImage(blog: BlogEntity, userId: AggregateID): void {
    const backgroundImageUrl = blog.backgroundImageUrl;

    if (!isNil(backgroundImageUrl)) {
      blog.updateBackgroundImage(null, userId);
    }
  }
}
