import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { PatchUpdateBlogCommand } from '@features/blog/commands/patch-update-blog/patch-update-blog.command';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getTsid } from 'tsid-ts';

@CommandHandler(PatchUpdateBlogCommand)
export class PatchUpdateBlogCommandHandler
  implements ICommandHandler<PatchUpdateBlogCommand, void>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: PatchUpdateBlogCommand): Promise<void> {
    const {
      userId,
      blogId,
      backgroundImageFile,
      name,
      description,
      dDayStartDate,
    } = command;

    if ([backgroundImageFile, name, description, dDayStartDate].every(isNil)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.MISSING_UPDATE_FIELD,
      });
    }

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!blog.isMemberOfBlog(userId)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    if (!isNil(description)) {
      blog.editDescription(description);
    }

    if (!isNil(dDayStartDate)) {
      blog.editDDayStartDate(dDayStartDate);
    }

    if (!isNil(name)) {
      blog.editName(name);
    }

    if (!isNil(backgroundImageFile)) {
      await this.deleteBackgroundImage(blog);

      /**
       * @todo 현재 파일에 관련한 중복 로직이 많음.
       * 또한 현재 Attachment를 생성하는 방식은 CreateAttachmentHandler
       * 혹은 각 도메인의 핸들러에서 외부의 AggregateRoot인 Attachment를 생성해주는데
       * Attachment 관련한 작업의 중복 제거를 위함 및
       * Attachment의 LifeCycle에 관한 책임을 갖고 있는 중간 다리 역할인 AttachmentService가 필요해 보임.
       * 추후에 수정 필요.
       */
      const { mimeType, capacity, buffer } = backgroundImageFile;

      const id = getTsid().toBigInt();
      const path = BlogEntity.BLOG_BACKGROUND_IMAGE_PATH_PREFIX + id;

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
            path,
            url,
          }),
        });

        await this.attachmentRepository.create(attachment);

        blog.editBackgroundImagePath(path);
      } catch (error: any) {
        await this.s3Service.deleteFilesFromS3([path]);

        throw new HttpInternalServerErrorException({
          code: COMMON_ERROR_CODE.SERVER_ERROR,
          ctx: 'Failed files upload',
          stack: error.stack,
        });
      }
    } else if (backgroundImageFile === null) {
      await this.deleteBackgroundImage(blog);
    }

    await this.blogRepository.update(blog);
  }

  private async deleteBackgroundImage(blog: BlogEntity): Promise<void> {
    const backgroundImageUrl = blog.backgroundImageUrl;

    if (!isNil(backgroundImageUrl)) {
      const existingAttachment = (
        await this.attachmentRepository.findByUrls([backgroundImageUrl])
      )[0];

      if (isNil(existingAttachment)) {
        return;
      }

      await this.s3Service.deleteFilesFromS3([existingAttachment.path]);

      existingAttachment.delete();

      await this.attachmentRepository.delete(existingAttachment);

      blog.editBackgroundImagePath(null);
    }
  }
}
