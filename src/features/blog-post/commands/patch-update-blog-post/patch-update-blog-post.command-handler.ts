import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostAttachmentRepositoryPort } from '@features/blog-post/blog-post-attachment/repositories/blog-post-attachment.repository-port';
import { BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-attachment/tokens/di.token';
import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { BlogPostTagRepositoryPort } from '@features/blog-post/blog-post-tag/repositories/blog-post-tag.repository-port';
import { BLOG_POST_TAG_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-tag/tokens/di.token';
import { PatchUpdateBlogPostCommand } from '@features/blog-post/commands/patch-update-blog-post/patch-update-blog-post.command';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { TagRepositoryPort } from '@features/tag/repositories/tag.repository-port';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { AggregateID } from '@libs/ddd/entity.base';
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

@CommandHandler(PatchUpdateBlogPostCommand)
export class PatchUpdateBlogPostCommandHandler
  implements ICommandHandler<PatchUpdateBlogPostCommand, void>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
    @Inject(TAG_REPOSITORY_DI_TOKEN)
    private readonly tagRepository: TagRepositoryPort,
    @Inject(BLOG_POST_TAG_REPOSITORY_DI_TOKEN)
    private readonly blogPostTagRepository: BlogPostTagRepositoryPort,
    @Inject(BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostAttachmentRepository: BlogPostAttachmentRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: PatchUpdateBlogPostCommand): Promise<void> {
    const {
      blogId,
      blogPostId,
      userId,
      title,
      contents,
      date,
      location,
      isPublic,
      tagNames,
      fileUrls,
    } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const userConnection =
      await this.userConnectionRepository.findOneByIdAndStatus(
        blog.connectionId,
        UserConnectionStatus.ACCEPTED,
      );

    if (isNil(userConnection)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: '블로그가 존재하는데 ACCEPTED된 userConnection이 존재하지 않을 수 없음.',
      });
    }

    if (!userConnection.isPartOfConnection(userId)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const blogPost = await this.blogPostRepository.findOneById(blogPostId, {
      blogPostAttachments: true,
      blogPostTags: true,
    });

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const newBlogPostTags: BlogPostTagEntity[] = [];
    const newBlogPostAttachments: BlogPostAttachmentEntity[] = [];

    if (isPublic === true) {
      blogPost.switchToPublic();
    } else if (isPublic === false) {
      blogPost.switchToPrivate();
    }

    if (title) {
      blogPost.editTitle(title);
    }

    if (date) {
      blogPost.editDate(date);
    }

    if (location) {
      blogPost.editLocation(location);
    }

    if (contents) {
      const attachmentIds = blogPost.blogPostAttachments.map(
        (blogPostAttachment) => blogPostAttachment.attachmentId,
      );

      const existingAttachments =
        await this.attachmentRepository.findByIdsAndUploadType(
          attachmentIds,
          AttachmentUploadType.IMAGE,
        );

      const jsonContents = JSON.stringify(contents);

      const deletedAttachmentIdsSet = new Set<AggregateID>();

      const deletedAttachments = existingAttachments.filter(
        (existingAttachment) => {
          const isDeleted = !jsonContents.includes(existingAttachment.url);

          if (isDeleted) {
            deletedAttachmentIdsSet.add(existingAttachment.id);
          }

          return isDeleted;
        },
      );

      await Promise.all([
        this.s3Service.deleteFilesFromS3(
          deletedAttachments.map((attachment) => attachment.path),
        ),
        this.attachmentRepository.bulkDelete(deletedAttachments),
      ]);

      const deletedBlogPostAttachments = blogPost.blogPostAttachments.filter(
        (blogPostAttachment) =>
          deletedAttachmentIdsSet.has(blogPostAttachment.attachmentId),
      );

      deletedBlogPostAttachments.forEach((blogPostAttachment) =>
        blogPost.deleteBlogPostAttachment(blogPostAttachment),
      );

      blogPost.editContents(contents);
    }

    if (tagNames) {
      await this.blogPostTagRepository.bulkDeleteByBlogPostId(blogPostId);

      if (tagNames.length) {
        const tags = await this.tagRepository.findByNames(tagNames);
        const existingTagNamesSet = new Set(tags.map((tag) => tag.name));
        const newTagNames = tagNames.filter(
          (name) => !existingTagNamesSet.has(name),
        );

        const newTagEntities = newTagNames.map((name) =>
          TagEntity.create({ name, userId }),
        );

        await this.tagRepository.bulkCreate(newTagEntities);
        tags.push(...newTagEntities);

        newBlogPostTags.push(
          ...tags.map((tag) => blogPost.createBlogPostTag(tag)),
        );
      }
    }

    if (fileUrls?.length) {
      const uploadedAttachments =
        await this.attachmentRepository.findByUrls(fileUrls);

      const result = await this.s3Service.moveFiles(
        uploadedAttachments.map((attachment) => attachment.path),
        BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX,
        AttachmentEntity.ATTACHMENT_PATH_PREFIX,
      );

      const changedAttachments: AttachmentEntity[] = [];
      const notExistingAttachments: AttachmentEntity[] = [];
      const changedUrlInfos: {
        oldAttachmentUrl: string;
        newAttachmentUrl: string;
      }[] = [];

      uploadedAttachments.forEach((attachment) => {
        const pathInfo = result[attachment.path];

        if (pathInfo.isExiting) {
          changedUrlInfos.push({
            oldAttachmentUrl: attachment.url,
            newAttachmentUrl: pathInfo.movedUrl,
          });

          attachment.changeLocation({
            path: pathInfo.movedPath,
            url: pathInfo.movedUrl,
          });

          changedAttachments.push(attachment);
        } else {
          notExistingAttachments.push(attachment);
        }
      });

      if (changedAttachments.length) {
        await Promise.all(
          changedAttachments.map(
            async (attachment) =>
              await this.attachmentRepository.update(attachment),
          ),
        );

        if (contents) {
          let jsonContents = JSON.stringify(contents);

          changedUrlInfos.forEach(({ oldAttachmentUrl, newAttachmentUrl }) => {
            jsonContents = jsonContents.replace(
              oldAttachmentUrl,
              newAttachmentUrl,
            );
          });

          blogPost.editContents(JSON.parse(jsonContents));
        }
      }

      if (notExistingAttachments.length) {
        notExistingAttachments.forEach((attachment) => attachment.delete());

        await this.attachmentRepository.bulkDelete(notExistingAttachments);
      }

      newBlogPostAttachments.push(
        ...changedAttachments.map((attachment) =>
          blogPost.createBlogPostAttachment(attachment),
        ),
      );
    }

    await Promise.all([
      this.blogPostRepository.update(blogPost),
      this.blogPostTagRepository.bulkCreate(newBlogPostTags),
      this.blogPostAttachmentRepository.bulkCreate(newBlogPostAttachments),
    ]);
  }
}
