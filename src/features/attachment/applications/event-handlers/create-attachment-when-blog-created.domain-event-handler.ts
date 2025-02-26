import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { BlogCreatedDomainEvent } from '@features/blog/domain/events/blog-created.domain-event';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CreateAttachmentWhenBlogCreatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(BlogCreatedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: BlogCreatedDomainEvent) {
    const { backgroundImageFile, createdBy } = event;

    if (isNil(backgroundImageFile)) {
      return;
    }

    await this.attachmentRepository.create(
      AttachmentEntity.create(
        {
          id: backgroundImageFile.fileId,
          capacity: BigInt(backgroundImageFile.capacity),
          mimeType: backgroundImageFile.mimeType,
          uploadType: AttachmentUploadType.FILE,
          userId: createdBy,
          path: backgroundImageFile.backgroundImagePath.replace(
            backgroundImageFile.fileId.toString(),
            '',
          ),
          url: backgroundImageFile.attachmentUrl,
        },
        backgroundImageFile.buffer,
      ),
    );
  }
}
