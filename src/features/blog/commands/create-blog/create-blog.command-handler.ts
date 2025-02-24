import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { BLOG_ERROR_CODE } from '@libs/exceptions/types/errors/blog/blog-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { Location } from '@features/attachment/domain/value-objects/location.value-object';
import { getTsid } from 'tsid-ts';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler
  implements ICommandHandler<CreateBlogCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
  ) {}

  async execute(command: CreateBlogCommand): Promise<AggregateID> {
    const { userId, name, description, dDayStartDate, backgroundImageFile } =
      command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnections: true,
      requesterConnections: true,
    });

    if (isNil(user)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
      });
    }

    const existingBlog = await this.blogRepository.findOneByConnectionId(
      acceptedConnection.id,
    );

    if (!isNil(existingBlog)) {
      throw new HttpConflictException({
        code: BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG,
      });
    }

    let backgroundImagePath: string | null = null;

    if (!isNil(backgroundImageFile)) {
      const { mimeType, capacity, buffer } = backgroundImageFile;

      const id = getTsid().toBigInt();
      const path = BlogEntity.BLOG_BACKGROUND_IMAGE_PATH_PREFIX + id;

      const url = await this.s3Service.uploadFileToS3(
        {
          buffer,
          mimeType,
        },
        path,
      );

      try {
        const attachment = AttachmentEntity.create(
          {
            id,
            userId,
            capacity: BigInt(capacity),
            mimeType,
            uploadType: AttachmentUploadType.FILE,
            location: new Location({
              path,
              url,
            }),
          },
          buffer,
        );

        await this.attachmentRepository.create(attachment);

        backgroundImagePath = path;
      } catch (err: any) {
        await this.s3Service.deleteFilesFromS3([path]);

        throw new HttpInternalServerErrorException({
          code: COMMON_ERROR_CODE.SERVER_ERROR,
          ctx: 'Failed files upload',
          stack: err.stack,
        });
      }
    }

    const blog = BlogEntity.create({
      createdBy: userId,
      connectionId: acceptedConnection.id,
      name,
      description,
      dDayStartDate,
      backgroundImagePath,
      memberIds: [
        acceptedConnection.requesterId,
        acceptedConnection.requestedId,
      ],
    });

    await this.blogRepository.create(blog);

    return blog.id;
  }
}
