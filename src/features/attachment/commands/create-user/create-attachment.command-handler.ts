import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '@features/user/domain/user.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { AggregateID } from '@libs/ddd/entity.base';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { CreateAttachmentsCommand } from '@features/attachment/commands/create-user/create-attachment.command';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { getTsid } from 'tsid-ts';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { S3_SERVICE_TOKEN } from '@libs/s3/tokens/di.token';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';

@CommandHandler(CreateAttachmentsCommand)
export class CreateAttachmentsCommandHandler
  implements ICommandHandler<CreateAttachmentsCommand, AggregateID>
{
  constructor(
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
    @Inject(S3_SERVICE_TOKEN)
    private readonly s3Service: S3ServicePort,
  ) {}
  @Transactional()
  async execute(command: CreateAttachmentsCommand): Promise<AggregateID> {
    const { files } = command;

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const id = getTsid().toBigInt();
        const path =
          this.appConfigService.get<string>(ENV_KEY.AWS_S3_ATTACHMENT_PATH) +
          id;

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
          buffer: file.buffer,
        };
      }),
    );

    const attachments = files.map((file) =>
      AttachmentEntity.create({
        id: getTsid().toBigInt(),
        userId: file.userId,
        url: file.url,
        path: file.path,
        mimeType: file.mimeType,
        capacity: BigInt(file.capacity),
      }),
    );

    const user = await UserEntity.create({
      nickname: command.nickname,
      mbti: command.mbti,
      email: command.email,
      password: hashedPassword,
      loginType: command.loginType,
    });

    await this.userRepository.create(user);

    return user.id;
  }
}
