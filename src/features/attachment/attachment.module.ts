import { CreateAttachmentWhenBlogCreatedDomainEventHandler } from '@features/attachment/applications/event-handlers/create-attachment-when-blog-created.domain-event-handler';
import { CreateThumbnailAttachmentWhenBlogPostCreatedDomainEventHandler } from '@features/attachment/applications/event-handlers/create-thumbnail-attachment-when-blog-post-created.domain-event-handler';
import { DeleteAttachmentDomainEventHandler } from '@features/attachment/applications/event-handlers/delete-attachment.domain-event-handler';
import { DeleteAttachmentsWhenBlogPostUpdatedDomainEventHandler } from '@features/attachment/applications/event-handlers/delete-attachments-when-blog-post-updated.domain-event-hanlder';
import { MoveAttachmentPathDomainEventHandler } from '@features/attachment/applications/event-handlers/move-attachment-path.domain-event-handler';
import { UpdateAttachmentWhenBlogBackgroundImageUpdatedDomainEventHandler } from '@features/attachment/applications/event-handlers/update-attachment-when-blog-background-image-updated.domain-event-handler';
import { UpdateAttachmentWhenUserProfileImageUpdatedDomainEventHandler } from '@features/attachment/applications/event-handlers/update-attachment-when-user-profile-image-updated.domain-event-handler';
import { UpdateThumbnailAttachmentWhenBlogPostUpdatedDomainEventHandler } from '@features/attachment/applications/event-handlers/update-thumbnail-attachment-when-blog-post-updated.domain-event-handler';
import { UploadAttachmentDomainEventHandler } from '@features/attachment/applications/event-handlers/upload-attachment.domain-event-handler';
import { CreateAttachmentsCommandHandler } from '@features/attachment/commands/create-attachments/create-attachments.command-handler';
import { AttachmentController } from '@features/attachment/controllers/attachment.controller';
import { AttachmentMapper } from '@features/attachment/mappers/attachment.mapper';
import { AttachmentRepository } from '@features/attachment/repositories/attachment.repository';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { S3Module } from '@libs/s3/s3.module';
import { Module, Provider } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

const controllers = [AttachmentController];

const repositories: Provider[] = [
  {
    provide: ATTACHMENT_REPOSITORY_DI_TOKEN,
    useClass: AttachmentRepository,
  },
];

const mappers: Provider[] = [AttachmentMapper];

const commandHandlers: Provider[] = [CreateAttachmentsCommandHandler];

const eventHandlers: Provider[] = [
  UploadAttachmentDomainEventHandler,
  MoveAttachmentPathDomainEventHandler,
  DeleteAttachmentDomainEventHandler,
  CreateAttachmentWhenBlogCreatedDomainEventHandler,
  UpdateAttachmentWhenBlogBackgroundImageUpdatedDomainEventHandler,
  UpdateAttachmentWhenUserProfileImageUpdatedDomainEventHandler,
  CreateThumbnailAttachmentWhenBlogPostCreatedDomainEventHandler,
  DeleteAttachmentsWhenBlogPostUpdatedDomainEventHandler,
  UpdateThumbnailAttachmentWhenBlogPostUpdatedDomainEventHandler,
];

@Module({
  imports: [NestjsFormDataModule, S3Module],
  controllers,
  providers: [
    ...repositories,
    ...mappers,
    ...commandHandlers,
    ...eventHandlers,
  ],
  exports: [...repositories],
})
export class AttachmentModule {}
