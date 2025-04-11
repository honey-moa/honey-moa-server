import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import type { BlogPostTagRepositoryPort } from '@features/blog-post/blog-post-tag/repositories/blog-post-tag.repository-port';
import { BLOG_POST_TAG_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-tag/tokens/di.token';
import { BlogPostUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-updated.domain-event';
import { CreateNewTagsCommand } from '@features/tag/commands/create-new-tags/create-new-tags.command';
import type { AggregateID } from '@libs/ddd/entity.base';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import type { CommandBus } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UpdateTagsWhenBlogPostUpdatedDomainEventHandler {
  constructor(
    private readonly commandBus: CommandBus,

    @Inject(BLOG_POST_TAG_REPOSITORY_DI_TOKEN)
    private readonly blogPostTagRepository: BlogPostTagRepositoryPort,
  ) {}

  @OnEvent(BlogPostUpdatedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: BlogPostUpdatedDomainEvent) {
    const { updatedProps, userId, aggregateId } = event;

    if (isNil(updatedProps.tagNames)) {
      return;
    }

    await this.blogPostTagRepository.bulkDeleteByBlogPostId(aggregateId);

    const { tagNames } = updatedProps;

    if (tagNames.length) {
      const command = new CreateNewTagsCommand({
        userId,
        tagNames,
      });

      const result = await this.commandBus.execute<
        CreateNewTagsCommand,
        AggregateID[]
      >(command);

      await this.blogPostTagRepository.bulkCreate(
        result.map((tagId) =>
          BlogPostTagEntity.create({ blogPostId: aggregateId, tagId }),
        ),
      );
    }
  }
}
