import type { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { BlogPostThumbnailImagePathUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-thumbnail-imgae-path-updated.domain-event';
import { isNil } from '@libs/utils/util';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UpdateThumbnailAttachmentWhenBlogPostUpdatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogPostThumbnailImagePathUpdatedDomainEvent.name, {
    async: true,
  })
  @Transactional(Propagation.RequiresNew)
  async handle(event: BlogPostThumbnailImagePathUpdatedDomainEvent) {
    const {
      oldThumbnailImagePath,
      newThumbnailImagePath,
      attachmentUrl,
      attachmentPath,
    } = event;

    if (oldThumbnailImagePath === newThumbnailImagePath) {
      return;
    }

    if (!isNil(newThumbnailImagePath)) {
      if (!isNil(oldThumbnailImagePath)) {
        await this.deleteOldAttachment(
          oldThumbnailImagePath as string,
          attachmentPath,
        );
      }

      const attachmentId = BigInt(
        newThumbnailImagePath.replace(attachmentPath, ''),
      );

      const existingAttachment =
        await this.attachmentRepository.findOneById(attachmentId);

      if (isNil(existingAttachment)) {
        return;
      }

      existingAttachment.changeLocation({
        path: newThumbnailImagePath,
        url: `${attachmentUrl}/${newThumbnailImagePath}`,
      });

      await this.attachmentRepository.update(existingAttachment);
    } else {
      await this.deleteOldAttachment(
        oldThumbnailImagePath as string,
        attachmentPath,
      );
    }
  }

  private async deleteOldAttachment(
    oldThumbnailImagePath: string,
    attachmentPath: string,
  ) {
    const attachmentId = BigInt(
      oldThumbnailImagePath.replace(attachmentPath, ''),
    );

    const existingAttachment =
      await this.attachmentRepository.findOneById(attachmentId);

    if (!isNil(existingAttachment)) {
      existingAttachment.delete();
      await this.attachmentRepository.delete(existingAttachment);
    }
  }
}
