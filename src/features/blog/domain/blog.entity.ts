import { getTsid } from 'tsid-ts';

import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogProps,
  CreateBlogProps,
  HydratedBlogEntityProps,
} from '@features/blog/domain/blog.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { UserEntity } from '@features/user/domain/user.entity';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { BlogDeletedDomainEvent } from '@features/blog/domain/events/blog-deleted.domain-event';
import { isNil } from '@libs/utils/util';
import { BlogCreatedDomainEvent } from '@features/blog/domain/events/blog-created.domain-event';
import { FileProps } from '@libs/types/type';
import { BlogBackgroundImagePathUpdatedDomainEvent } from '@features/blog/domain/events/blog-background-image-updated.domain-event';

export class BlogEntity extends AggregateRoot<BlogProps> {
  static readonly BLOG_ATTACHMENT_URL = process.env
    .BLOG_ATTACHMENT_URL as string;

  static readonly BLOG_ATTACHMENT_PATH_PREFIX = 'blog/';

  static readonly BLOG_BACKGROUND_IMAGE_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
  ];

  static create(create: CreateBlogProps): BlogEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    let fileId: AggregateID | null = null;

    const { backgroundImageFile, ...rest } = create;

    if (!isNil(backgroundImageFile)) {
      fileId = getTsid().toBigInt();
    }

    const props: BlogProps = {
      ...rest,
      backgroundImagePath: fileId
        ? BlogEntity.BLOG_ATTACHMENT_PATH_PREFIX + fileId
        : null,
      deletedAt: null,
    };

    const blog = new BlogEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    blog.addEvent(
      new BlogCreatedDomainEvent({
        aggregateId: id,
        backgroundImageFile: backgroundImageFile
          ? {
              ...backgroundImageFile,
              fileId: fileId as AggregateID,
              backgroundImagePath: props.backgroundImagePath as string,
              attachmentUrl: BlogEntity.BLOG_ATTACHMENT_URL,
            }
          : null,
        createdBy: create.createdBy,
      }),
    );

    return blog;
  }

  get hydrateProps(): HydratedBlogEntityProps {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.props.name,
      members: this.members ? this.members : undefined,
    };
  }

  get connectionId(): AggregateID {
    return this.props.connectionId;
  }

  get memberIds(): AggregateID[] {
    return this.props.memberIds;
  }

  get members(): HydratedUserEntityProps[] | null {
    return this.props.members || null;
  }

  get backgroundImagePath(): string | null {
    return this.props.backgroundImagePath;
  }

  get backgroundImageUrl(): string | null {
    return this.backgroundImagePath
      ? `${BlogEntity.BLOG_ATTACHMENT_URL}/${this.backgroundImagePath}`
      : null;
  }

  isMember(userId: AggregateID): boolean {
    return this.memberIds.includes(userId);
  }

  editName(name: string) {
    if (!Guard.lengthIsBetween(name, 1, 30)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'name must be between 1 and 30 characters',
      });
    }

    this.props.name = name;
  }

  editDescription(description: string) {
    if (!Guard.lengthIsBetween(description, 1, 255)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'description must be between 1 and 255 characters',
      });
    }

    this.props.description = description;
  }

  updateBackgroundImage(
    backgroundImageFile: FileProps | null,
    userId: AggregateID,
  ) {
    if (isNil(backgroundImageFile)) {
      if (backgroundImageFile === this.props.backgroundImagePath) {
        return;
      }

      this.addEvent(
        new BlogBackgroundImagePathUpdatedDomainEvent({
          aggregateId: this.id,
          backgroundImageFile: null,
          previousBackgroundImagePath: this.props.backgroundImagePath,
          userId,
        }),
      );

      this.props.backgroundImagePath = null;

      return;
    }

    const fileId = getTsid().toBigInt();
    const backgroundImagePath = BlogEntity.BLOG_ATTACHMENT_PATH_PREFIX + fileId;

    this.addEvent(
      new BlogBackgroundImagePathUpdatedDomainEvent({
        aggregateId: this.id,
        backgroundImageFile: {
          ...backgroundImageFile,
          fileId,
          backgroundImagePath,
          attachmentUrl: BlogEntity.BLOG_ATTACHMENT_URL,
        },
        previousBackgroundImagePath: this.props.backgroundImagePath,
        userId,
      }),
    );

    this.props.backgroundImagePath = backgroundImagePath;
  }

  editDDayStartDate(dDayStartDate: string) {
    if (!Guard.lengthIsBetween(dDayStartDate, 1, 20)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'dDayStartDate must be between 1 and 20 characters',
      });
    }

    this.props.dDayStartDate = dDayStartDate;
  }

  hydrateMember(user: UserEntity) {
    (this.props.members = this.props.members ?? []).push(user.hydrateProps);
  }

  delete(): void {
    this.addEvent(new BlogDeletedDomainEvent({ aggregateId: this.id }));
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.createdBy) ||
      !Guard.isPositiveBigInt(this.props.connectionId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'createdBy 혹은 connectionId가 PositiveInt가 아님',
      });
    }
  }
}
