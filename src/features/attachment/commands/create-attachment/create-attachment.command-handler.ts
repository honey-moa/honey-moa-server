import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { CreateAttachmentsCommand } from '@features/attachment/commands/create-attachment/create-attachment.command';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { getTsid } from 'tsid-ts';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';

@CommandHandler(CreateAttachmentsCommand)
export class CreateAttachmentsCommandHandler
  implements ICommandHandler<CreateAttachmentsCommand, string[]>
{
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
  ) {}

  @Transactional()
  async execute(command: CreateAttachmentsCommand): Promise<string[]> {
    const { files } = command;

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const id = getTsid().toBigInt();
        const path = AttachmentEntity.ATTACHMENT_PATH_PREFIX + id;

        const url = await this.s3Service.uploadFileToS3(
          {
            buffer: file.buffer,
            mimetype: file.mimeType,
          },
          path,
        );

        return {
          id,
          userId: file.userId,
          path,
          url,
          mimeType: file.mimeType,
          capacity: BigInt(file.capacity),
          uploadType: file.uploadType,
        };
      }),
    );

    try {
      const attachments = uploadedFiles.map((file) =>
        AttachmentEntity.create({
          ...file,
          location: new Location({ path: file.path, url: file.url }),
        }),
      );

      await this.attachmentRepository.bulkCreate(attachments);

      return attachments.map((attachment) => attachment.url);
    } catch (err: any) {
      await this.s3Service.deleteFilesFromS3(
        uploadedFiles.map((file) => file.path),
      );

      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Failed files upload',
        stack: err.stack,
      });
    }
  }
}
