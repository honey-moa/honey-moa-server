import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import type { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { BlogBackgroundImagePathUpdatedDomainEvent } from '@features/blog/domain/events/blog-background-image-updated.domain-event';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UpdateAttachmentWhenBlogBackgroundImageUpdatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogBackgroundImagePathUpdatedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: BlogBackgroundImagePathUpdatedDomainEvent) {
    const { backgroundImageFile, previousBackgroundImagePath, userId } = event;

    if (isNil(backgroundImageFile)) {
      if (backgroundImageFile === previousBackgroundImagePath) {
        return;
      }

      await this.deletePreviousAttachment(previousBackgroundImagePath);

      return;
    }

    if (!isNil(previousBackgroundImagePath)) {
      await this.deletePreviousAttachment(previousBackgroundImagePath);
    }

    const newAttachment = AttachmentEntity.create(
      {
        id: backgroundImageFile.fileId,
        userId,
        path: backgroundImageFile.backgroundImagePath.replace(
          backgroundImageFile.fileId.toString(),
          '',
        ),
        mimeType: backgroundImageFile.mimeType,
        capacity: BigInt(backgroundImageFile.capacity),
        uploadType: AttachmentUploadType.FILE,
        url: backgroundImageFile.attachmentUrl,
      },
      backgroundImageFile.buffer,
    );

    await this.attachmentRepository.create(newAttachment);
  }

  private async deletePreviousAttachment(
    previousBackgroundImagePath: string,
  ): Promise<void> {
    const existingAttachment = await this.attachmentRepository.findOneByPath(
      previousBackgroundImagePath,
    );

    if (isNil(existingAttachment)) {
      return;
    }

    existingAttachment.delete();

    await this.attachmentRepository.delete(existingAttachment);
  }
}
