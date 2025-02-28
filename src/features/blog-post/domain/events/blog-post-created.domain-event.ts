import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogPostCreatedDomainEvent extends DomainEvent {
  readonly userId: AggregateID;
  readonly blogId: AggregateID;
  readonly thumbnailImageUrl: string | null;
  readonly attachmentUrl: string;
  readonly attachmentPath: string;
  readonly tagNames: string[];
  readonly contents: Array<Record<string, any>>;
  readonly fileUrls: string[];

  constructor(props: DomainEventProps<BlogPostCreatedDomainEvent>) {
    super(props);

    const {
      userId,
      blogId,
      thumbnailImageUrl,
      attachmentPath,
      attachmentUrl,
      tagNames,
      contents,
      fileUrls,
    } = props;

    this.userId = userId;
    this.blogId = blogId;
    this.thumbnailImageUrl = thumbnailImageUrl;
    this.attachmentPath = attachmentPath;
    this.attachmentUrl = attachmentUrl;
    this.tagNames = tagNames;
    this.contents = contents;
    this.fileUrls = fileUrls;
  }
}
