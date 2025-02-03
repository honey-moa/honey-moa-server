import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { CreateBlogPostCommand } from '@features/blog-post/commands/create-blog-post/create-blog-post.command';
import { BlogPostTagRepositoryPort } from '@features/blog-post/blog-post-tag/repositories/blog-post-tag.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_TAG_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-tag/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { Transactional } from '@nestjs-cls/transactional';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { TagRepositoryPort } from '@features/tag/repositories/tag.repository-port';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { S3_SERVICE_TOKEN } from '@libs/s3/tokens/di.token';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-attachment/tokens/di.token';
import { BlogPostAttachmentRepositoryPort } from '@features/blog-post/blog-post-attachment/repositories/blog-post-attachment.repository-port';

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostCommandHandler
  implements ICommandHandler<CreateBlogPostCommand, AggregateID>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(BLOG_POST_TAG_REPOSITORY_DI_TOKEN)
    private readonly blogPostTagRepository: BlogPostTagRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
    @Inject(TAG_REPOSITORY_DI_TOKEN)
    private readonly tagRepository: TagRepositoryPort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
    @Inject(S3_SERVICE_TOKEN)
    private readonly s3Service: S3ServicePort,
    @Inject(BLOG_POST_ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostAttachmentRepository: BlogPostAttachmentRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: CreateBlogPostCommand): Promise<AggregateID> {
    const {
      blogId,
      userId,
      title,
      contents,
      date,
      location,
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
        ctx: 'blog가 존재하는 데 user connection이 존재하지 않을 수 없음.',
      });
    }

    if (
      userConnection.requestedId !== userId &&
      userConnection.requesterId !== userId
    ) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const blogPost = BlogPostEntity.create({
      blogId,
      userId,
      title,
      contents,
      date,
      location,
    });

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

    const blogPostTags = tags.map((tag) => blogPost.createBlogPostTag(tag));

    const attachments = await this.attachmentRepository.findByUrls(fileUrls);
    const result = await this.s3Service.moveFiles(
      attachments.map((attachment) => attachment.path),
      BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX,
      AttachmentEntity.ATTACHMENT_PATH_PREFIX,
    );

    const changedAttachments: AttachmentEntity[] = [];
    const notExistingAttachments: AttachmentEntity[] = [];
    const changedUrlInfos: {
      oldAttachmentUrl: string;
      newAttachmentUrl: string;
    }[] = [];

    attachments.forEach((attachment) => {
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

      let jsonContents = JSON.stringify(blogPost.contents);

      changedUrlInfos.forEach(({ oldAttachmentUrl, newAttachmentUrl }) => {
        jsonContents = jsonContents.replace(oldAttachmentUrl, newAttachmentUrl);
      });

      blogPost.reviseContents(JSON.parse(jsonContents));
    }

    if (notExistingAttachments.length) {
      notExistingAttachments.forEach((attachment) => attachment.delete());

      await this.attachmentRepository.bulkDelete(notExistingAttachments);
    }

    const blogPostAttachments = changedAttachments.map((attachment) =>
      blogPost.createBlogPostAttachment(attachment),
    );

    await this.blogPostRepository.create(blogPost);
    await this.blogPostTagRepository.bulkCreate(blogPostTags);
    await this.blogPostAttachmentRepository.bulkCreate(blogPostAttachments);

    return blogPost.id;
  }
}
