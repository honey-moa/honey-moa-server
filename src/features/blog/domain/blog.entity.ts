import { getTsid } from 'tsid-ts';

import {
  BlogProps,
  CreateBlogProps,
  HydratedBlogEntityProps,
  UpdateBlogProps,
} from '@features/blog/domain/blog.entity-interface';
import {
  BlogValidationError,
  NotABlogMemberError,
} from '@features/blog/domain/blog.errors';
import { BlogBackgroundImagePathUpdatedDomainEvent } from '@features/blog/domain/events/blog-background-image-updated.domain-event';
import { BlogCreatedDomainEvent } from '@features/blog/domain/events/blog-created.domain-event';
import { BlogDeletedDomainEvent } from '@features/blog/domain/events/blog-deleted.domain-event';
import { BlogUpdatedDomainEvent } from '@features/blog/domain/events/blog-updated.domain-event';
import { UserEntity } from '@features/user/domain/user.entity';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { Guard } from '@libs/guard';
import { FileProps } from '@libs/types/type';
import { isNil } from '@libs/utils/util';

export class BlogEntity extends AggregateRoot<BlogProps> {
  static readonly BLOG_ATTACHMENT_URL = process.env
    .BLOG_ATTACHMENT_URL as string;

  static readonly BLOG_ATTACHMENT_PATH_PREFIX = 'blog/';

  static readonly BLOG_BACKGROUND_IMAGE_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
  ];

  static readonly BLOG_D_DAY_START_DATE_LENGTH = {
    MIN: 1,
    MAX: 20,
  } as const;

  static readonly BLOG_DESCRIPTION_LENGTH = {
    MIN: 1,
    MAX: 255,
  } as const;

  static readonly BLOG_NAME_LENGTH = {
    MIN: 1,
    MAX: 30,
  } as const;

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

  update(update: UpdateBlogProps, userId: AggregateID) {
    const updatedProps: Partial<BlogProps> = {};

    if (!this.isMember(userId)) {
      throw new NotABlogMemberError();
    }

    if (!isNil(update.name)) {
      this.props.name = update.name;
      updatedProps.name = update.name;
    }

    if (!isNil(update.description)) {
      this.props.description = update.description;
      updatedProps.description = update.description;
    }

    if (!isNil(update.dDayStartDate)) {
      this.props.dDayStartDate = update.dDayStartDate;
      updatedProps.dDayStartDate = update.dDayStartDate;
    }

    if (!Guard.isEmpty(updatedProps)) {
      this.validate();

      this.addEvent(
        new BlogUpdatedDomainEvent({
          aggregateId: this.id,
          ...updatedProps,
          userId,
        }),
      );
    }
  }

  updateBackgroundImage(
    backgroundImageFile: FileProps | null,
    userId: AggregateID,
  ) {
    if (!this.isMember(userId)) {
      throw new NotABlogMemberError();
    }

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

  hydrateMember(user: UserEntity) {
    if (!this.props.members) this.props.members = [];

    this.props.members.push(user.hydrateProps);
  }

  delete(): void {
    this.addEvent(new BlogDeletedDomainEvent({ aggregateId: this.id }));
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.createdBy) ||
      !Guard.isPositiveBigInt(this.props.connectionId)
    ) {
      throw new BlogValidationError(
        'createdBy 혹은 connectionId가 PositiveInt가 아님',
      );
    }

    if (
      !Guard.lengthIsBetween(
        this.props.description,
        BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN,
        BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX,
      )
    ) {
      throw new BlogValidationError(
        'description must be between 1 and 255 characters',
      );
    }

    if (
      !Guard.lengthIsBetween(
        this.props.name,
        BlogEntity.BLOG_NAME_LENGTH.MIN,
        BlogEntity.BLOG_NAME_LENGTH.MAX,
      )
    ) {
      throw new BlogValidationError('name must be between 1 and 30 characters');
    }

    if (
      !Guard.lengthIsBetween(
        this.props.dDayStartDate,
        BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MIN,
        BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MAX,
      )
    ) {
      throw new BlogValidationError(
        'dDayStartDate must be between 1 and 20 characters',
      );
    }
  }
}
