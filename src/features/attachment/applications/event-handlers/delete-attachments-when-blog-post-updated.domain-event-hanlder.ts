import type { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { BlogPostUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-updated.domain-event';
import type { AggregateID } from '@libs/ddd/entity.base';
import { isNil } from '@libs/utils/util';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class DeleteAttachmentsWhenBlogPostUpdatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
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

    const { newContents, blogPostAttachments } = contents;

    if (!isNil(blogPostAttachments)) {
      const attachmentIds = blogPostAttachments.map(
        (blogPostAttachment) => blogPostAttachment.attachmentId,
      );

      const existingAttachments =
        await this.attachmentRepository.findByIdsAndUploadType(
          attachmentIds,
          AttachmentUploadType.IMAGE,
        );

      const jsonContents = JSON.stringify(newContents);

      const deletedAttachmentIdsSet = new Set<AggregateID>();

      const deletedAttachments = existingAttachments.filter(
        (existingAttachment) => {
          const isDeleted = !jsonContents.includes(existingAttachment.url);

          if (isDeleted) {
            existingAttachment.delete();
            deletedAttachmentIdsSet.add(existingAttachment.id);
          }

          return isDeleted;
        },
      );

      await this.attachmentRepository.bulkDelete(deletedAttachments);
    }
  }
}
