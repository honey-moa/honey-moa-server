import type { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import type { BlogPostAttachmentRepositoryPort } from '@features/blog-post/blog-post-attachment/repositories/blog-post-attachment.repository-port';
import { BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-attachment/tokens/di.token';
import { BlogPostCreatedDomainEvent } from '@features/blog-post/domain/events/blog-post-created.domain-event';
import type { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CreateContentsAttachmentsWhenBlogPostCreatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,

    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostAttachmentRepository: BlogPostAttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogPostCreatedDomainEvent.name, {
    async: true,
  })
  @Transactional(Propagation.RequiresNew)
  async handle(event: BlogPostCreatedDomainEvent) {
    const { contents, fileUrls } = event;

    const attachments = await this.attachmentRepository.findByUrls(fileUrls);

    const changedUrlInfos: {
      oldAttachmentUrl: string;
      newAttachmentUrl: string;
    }[] = [];

    if (!attachments.length) {
      return;
    }

    for (const attachment of attachments) {
      const movedPath =
        BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX +
        attachment.id;
      const movedUrl = `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/${movedPath}`;

      changedUrlInfos.push({
        oldAttachmentUrl: attachment.url,
        newAttachmentUrl: movedUrl,
      });

      attachment.changeLocation({
        path: movedPath,
        url: movedUrl,
      });
    }

    await Promise.all(
      attachments.map(
        async (attachment) =>
          await this.attachmentRepository.update(attachment),
      ),
    );

    let jsonContents = JSON.stringify(contents);

    for (const { oldAttachmentUrl, newAttachmentUrl } of changedUrlInfos) {
      jsonContents = jsonContents.replace(oldAttachmentUrl, newAttachmentUrl);
    }

    await this.blogPostRepository.updateContents(
      event.aggregateId,
      JSON.parse(jsonContents),
    );

    const blogPostAttachments = attachments.map((attachment) =>
      BlogPostAttachmentEntity.create({
        blogPostId: event.aggregateId,
        attachmentId: attachment.id,
      }),
    );

    await this.blogPostAttachmentRepository.bulkCreate(blogPostAttachments);
  }
}
