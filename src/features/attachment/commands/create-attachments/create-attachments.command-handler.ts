import { CreateAttachmentsCommand } from '@features/attachment/commands/create-attachments/create-attachments.command';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateAttachmentsCommand)
export class CreateAttachmentsCommandHandler
  implements ICommandHandler<CreateAttachmentsCommand, string[]>
{
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: CreateAttachmentsCommand): Promise<string[]> {
    const { files, userId } = command;

    const attachments = files.map((file) => {
      return AttachmentEntity.create(
        {
          capacity: BigInt(file.capacity),
          mimeType: file.mimeType,
          uploadType: file.uploadType,
          userId,
        },
        file.buffer,
      );
    });

    await this.attachmentRepository.bulkCreate(attachments);

    return attachments.map((attachment) => attachment.url);
  }
}
