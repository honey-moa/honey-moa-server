import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { CreateAttachmentsCommand } from '@features/attachment/commands/create-attachments/create-attachments.command';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { getTsid } from 'tsid-ts';

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
      const id = getTsid().toBigInt();

      const path = AttachmentEntity.ATTACHMENT_PATH_PREFIX + id;

      return AttachmentEntity.create(
        {
          id,
          capacity: BigInt(file.capacity),
          mimeType: file.mimeType,
          uploadType: file.uploadType,
          userId,
          location: new Location({
            path,
            url: `${AttachmentEntity.ATTACHMENT_URL}/${path}`,
          }),
        },
        file.buffer,
      );
    });

    await this.attachmentRepository.bulkCreate(attachments);

    return attachments.map((attachment) => attachment.url);
  }
}
