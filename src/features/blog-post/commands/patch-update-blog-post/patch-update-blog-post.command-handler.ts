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
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { UpdateBlogPostProps } from '@features/blog-post/domain/blog-post.entity-interface';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { TagRepositoryPort } from '@features/tag/repositories/tag.repository-port';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
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
      summary,
      thumbnailImageUrl,
    } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!blog.isMember(userId)) {
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

    const updateProps: UpdateBlogPostProps = {
      title,
      date,
      location,
      summary,
    };

    if (!isNil(contents)) {
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

      await this.attachmentRepository.bulkDelete(deletedAttachments);

      const deletedBlogPostAttachments = blogPost.blogPostAttachments.filter(
        (blogPostAttachment) =>
          deletedAttachmentIdsSet.has(blogPostAttachment.attachmentId),
      );

      deletedBlogPostAttachments.forEach((blogPostAttachment) =>
        blogPost.deleteBlogPostAttachment(blogPostAttachment),
      );

      updateProps.contents = contents;
    }

    if (!isNil(tagNames)) {
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

      const changedUrlInfos: {
        oldAttachmentUrl: string;
        newAttachmentUrl: string;
      }[] = [];

      if (uploadedAttachments.length) {
        uploadedAttachments.forEach((attachment) => {
          const movedPath =
            BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX +
            attachment.id;
          const movedUrl = `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/${movedPath}`;

          changedUrlInfos.push({
            oldAttachmentUrl: attachment.url,
            newAttachmentUrl: movedUrl,
          });

          attachment.changeLocation({
            path: movedPath,
            url: movedUrl,
          });
        });

        await Promise.all(
          uploadedAttachments.map(
            async (attachment) =>
              await this.attachmentRepository.update(attachment),
          ),
        );

        if (!isNil(contents)) {
          let jsonContents = JSON.stringify(contents);

          changedUrlInfos.forEach(({ oldAttachmentUrl, newAttachmentUrl }) => {
            jsonContents = jsonContents.replace(
              oldAttachmentUrl,
              newAttachmentUrl,
            );
          });

          updateProps.contents = JSON.parse(jsonContents);
        }
      }

      newBlogPostAttachments.push(
        ...uploadedAttachments.map((attachment) =>
          blogPost.createBlogPostAttachment(attachment),
        ),
      );
    }

    blogPost.update(updateProps);

    if (thumbnailImageUrl !== undefined) {
      await this.deleteThumbnailImage(blogPost);

      if (thumbnailImageUrl !== null) {
        const existingAttachment = (
          await this.attachmentRepository.findByUrls([thumbnailImageUrl])
        )[0];

        if (!isNil(existingAttachment)) {
          const movedPath =
            BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX +
            existingAttachment.id;
          const movedUrl = `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/${movedPath}`;

          blogPost.editThumbnailImagePath(movedPath);

          existingAttachment.changeLocation({
            path: movedPath,
            url: movedUrl,
          });

          await this.attachmentRepository.update(existingAttachment);
        }
      }
    }

    await Promise.all([
      this.blogPostRepository.update(blogPost),
      this.blogPostTagRepository.bulkCreate(newBlogPostTags),
      this.blogPostAttachmentRepository.bulkCreate(newBlogPostAttachments),
    ]);
  }

  private async deleteThumbnailImage(blogPost: BlogPostEntity): Promise<void> {
    const thumbnailImageUrl = blogPost.thumbnailImageUrl;

    if (!isNil(thumbnailImageUrl)) {
      const existingAttachment = (
        await this.attachmentRepository.findByUrls([thumbnailImageUrl])
      )[0];

      if (isNil(existingAttachment)) {
        return;
      }

      await this.s3Service.deleteFilesFromS3([existingAttachment.path]);

      existingAttachment.delete();

      await this.attachmentRepository.delete(existingAttachment);

      blogPost.editThumbnailImagePath(null);
    }
  }
}
