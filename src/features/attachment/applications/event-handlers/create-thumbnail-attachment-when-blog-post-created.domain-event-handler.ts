import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { BlogPostCreatedDomainEvent } from '@features/blog-post/domain/events/blog-post-created.domain-event';
import { isNil } from '@libs/utils/util';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CreateThumbnailAttachmentWhenBlogPostCreatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogPostCreatedDomainEvent.name, {
    async: true,
  })
  @Transactional(Propagation.RequiresNew)
  async handle(event: BlogPostCreatedDomainEvent) {
    const { thumbnailImageUrl, attachmentUrl, attachmentPath } = event;

    if (isNil(thumbnailImageUrl)) {
      return;
    }

    const attachmentId = BigInt(
      thumbnailImageUrl
        .replace(`${attachmentUrl}/`, '')
        .replace(attachmentPath, ''),
    );

    const existingAttachment =
      await this.attachmentRepository.findOneById(attachmentId);

    if (isNil(existingAttachment)) {
      return;
    }

    const movedPath = attachmentPath + existingAttachment.id;
    const movedUrl = `${attachmentUrl}/${movedPath}`;

    if (existingAttachment.path === movedPath) {
      return;
    }

    existingAttachment.changeLocation({
      path: movedPath,
      url: movedUrl,
    });

    await this.attachmentRepository.update(existingAttachment);
  }
}
