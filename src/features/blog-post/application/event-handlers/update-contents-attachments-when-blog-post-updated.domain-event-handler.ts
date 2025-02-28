import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostAttachmentRepositoryPort } from '@features/blog-post/blog-post-attachment/repositories/blog-post-attachment.repository-port';
import { BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-attachment/tokens/di.token';
import { BlogPostUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-updated.domain-event';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { isNil } from '@libs/utils/util';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UpdateContentsAttachmentsWhenBlogPostUpdatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,

    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostAttachmentRepository: BlogPostAttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogPostUpdatedDomainEvent.name, {
    async: true,
  })
  @Transactional(Propagation.RequiresNew)
  async handle(event: BlogPostUpdatedDomainEvent) {
    const { contents } = event.updatedProps;

    if (isNil(contents)) {
      return;
    }

    const { newContents, fileUrls } = contents;

    if (fileUrls?.length) {
      const uploadedAttachments =
        await this.attachmentRepository.findByUrls(fileUrls);

      const changedUrlInfos: {
        oldAttachmentUrl: string;
        newAttachmentUrl: string;
      }[] = [];

      if (uploadedAttachments.length) {
        uploadedAttachments.forEach((attachment) => {
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
        });

        await Promise.all(
          uploadedAttachments.map(
            async (attachment) =>
              await this.attachmentRepository.update(attachment),
          ),
        );

        let jsonContents = JSON.stringify(newContents);

        changedUrlInfos.forEach(({ oldAttachmentUrl, newAttachmentUrl }) => {
          jsonContents = jsonContents.replace(
            oldAttachmentUrl,
            newAttachmentUrl,
          );
        });

        const replacedContents = JSON.parse(jsonContents);

        await this.blogPostRepository.updateContents(
          event.aggregateId,
          replacedContents,
        );

        const newBlogPostAttachments = uploadedAttachments.map((attachment) =>
          BlogPostAttachmentEntity.create({
            blogPostId: event.aggregateId,
            attachmentId: attachment.id,
          }),
        );

        await this.blogPostAttachmentRepository.bulkCreate(
          newBlogPostAttachments,
        );
      }
    }
  }
}
