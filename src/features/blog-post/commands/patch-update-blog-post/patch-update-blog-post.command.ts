import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class PatchUpdateBlogPostCommand extends Command implements ICommand {
  readonly blogId: AggregateID;
  readonly blogPostId: AggregateID;
  readonly userId: AggregateID;
  readonly title?: string;
  readonly contents?: Array<Record<string, any>>;
  readonly date?: string;
  readonly location?: string;
  readonly isPublic?: boolean;
  readonly tagNames?: string[];
  readonly fileUrls?: string[];
  readonly summary?: string;
  readonly thumbnailImageUrl?: string | null;

  constructor(props: CommandProps<PatchUpdateBlogPostCommand>) {
    super(props);

    this.blogId = props.blogId;
    this.blogPostId = props.blogPostId;
    this.userId = props.userId;
    this.title = props.title;
    this.contents = props.contents;
    this.date = props.date;
    this.location = props.location;
    this.isPublic = props.isPublic;
    this.tagNames = props.tagNames;
    this.fileUrls = props.fileUrls;
    this.summary = props.summary;
    this.thumbnailImageUrl = props.thumbnailImageUrl;
  }
}
