import { Module, Provider } from '@nestjs/common';
import { AttachmentController } from '@features/attachment/controllers/attachment.controller';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentRepository } from '@features/attachment/repositories/attachment.repository';
import { AttachmentMapper } from '@features/attachment/mappers/attachment.mapper';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { S3Module } from '@libs/s3/s3.module';
import { CreateAttachmentsCommandHandler } from '@features/attachment/commands/create-attachments/create-attachments.command-handler';
import { UploadAttachmentDomainEventHandler } from '@features/attachment/applications/event-handlers/upload-attachment.domain-event-handler';
import { MoveAttachmentPathDomainEventHandler } from '@features/attachment/applications/event-handlers/move-attachment-path.domain-event-handler';

const controllers = [AttachmentController];

const repositories: Provider[] = [
  {
    provide: ATTACHMENT_REPOSITORY_DI_TOKEN,
    useClass: AttachmentRepository,
  },
];

const mappers: Provider[] = [AttachmentMapper];

const commandHandlers: Provider[] = [
  CreateAttachmentsCommandHandler,
  MoveAttachmentPathDomainEventHandler,
];

const eventHandlers: Provider[] = [UploadAttachmentDomainEventHandler];

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
