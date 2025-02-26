import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { UserProfileImagePathUpdatedDomainEvent } from '@features/user/domain/events/user-profile-image-path-updated.domain-event';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UpdateAttachmentWhenUserProfileImageUpdatedDomainEventHandler {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(UserProfileImagePathUpdatedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: UserProfileImagePathUpdatedDomainEvent) {
    const { profileImageFile, previousProfileImagePath, aggregateId } = event;

    if (isNil(profileImageFile)) {
      if (profileImageFile === previousProfileImagePath) {
        return;
      }

      await this.deletePreviousAttachment(previousProfileImagePath);

      return;
    }

    if (!isNil(previousProfileImagePath)) {
      await this.deletePreviousAttachment(previousProfileImagePath);
    }

    const newAttachment = AttachmentEntity.create(
      {
        id: profileImageFile.fileId,
        userId: aggregateId,
        path: profileImageFile.profileImagePath.replace(
          profileImageFile.fileId.toString(),
          '',
        ),
        mimeType: profileImageFile.mimeType,
        capacity: BigInt(profileImageFile.capacity),
        uploadType: AttachmentUploadType.FILE,
        url: profileImageFile.attachmentUrl,
      },
      profileImageFile.buffer,
    );

    await this.attachmentRepository.create(newAttachment);
  }

  private async deletePreviousAttachment(
    previousProfileImagePath: string,
  ): Promise<void> {
    const existingAttachment = await this.attachmentRepository.findOneByPath(
      previousProfileImagePath,
    );

    if (isNil(existingAttachment)) {
      return;
    }

    existingAttachment.delete();

    await this.attachmentRepository.delete(existingAttachment);
  }
}
