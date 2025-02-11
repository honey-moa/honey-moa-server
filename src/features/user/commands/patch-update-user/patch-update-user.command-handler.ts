import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { PatchUpdateUserCommand } from '@features/user/commands/patch-update-user/patch-update-user.command';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getTsid } from 'tsid-ts';

@CommandHandler(PatchUpdateUserCommand)
export class PatchUpdateUserCommandHandler
  implements ICommandHandler<PatchUpdateUserCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  async execute(command: PatchUpdateUserCommand): Promise<void> {
    const { userId, nickname, mbti, profileImageFile } = command;

    console.log(command);

    if ([nickname, mbti, profileImageFile].every(isNil)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.MISSING_UPDATE_FIELD,
      });
    }

    const user = await this.userRepository.findOneById(userId);

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!isNil(nickname)) {
      user.editNickname(nickname);
    }

    if (!isNil(mbti)) {
      user.editMbti(mbti);
    }

    if (!isNil(profileImageFile)) {
      /**
       * @todo 현재 파일에 관련한 중복 로직이 많음.
       * 또한 현재 Attachment를 생성하는 방식은 CreateAttachmentHandler
       * 혹은 각 도메인의 핸들러에서 외부의 AggregateRoot인 Attachment를 생성해주는데
       * Attachment 관련한 작업의 중복 제거를 위함 및
       * Attachment의 LifeCycle에 관한 책임을 갖고 있는 중간 다리 역할인 AttachmentService가 필요해 보임.
       * 추후에 수정 필요.
       */
      const { mimeType, capacity, buffer } = profileImageFile;

      const id = getTsid().toBigInt();
      const path = UserEntity.USER_PROFILE_IMAGE_PATH_PREFIX + id;

      const url = await this.s3Service.uploadFileToS3(
        {
          buffer: buffer,
          mimetype: mimeType,
        },
        path,
      );

      try {
        const attachment = AttachmentEntity.create({
          id,
          userId,
          capacity: BigInt(capacity),
          mimeType,
          uploadType: AttachmentUploadType.FILE,
          location: new Location({
            path: UserEntity.USER_PROFILE_IMAGE_PATH_PREFIX,
            url,
          }),
        });

        await this.attachmentRepository.create(attachment);

        user.editProfileImagePath(path);
      } catch (error: any) {
        await this.s3Service.deleteFilesFromS3([path]);

        throw new HttpInternalServerErrorException({
          code: COMMON_ERROR_CODE.SERVER_ERROR,
          ctx: 'Failed files upload',
          stack: error.stack,
        });
      }
    }

    await this.userRepository.update(user);
  }
}
