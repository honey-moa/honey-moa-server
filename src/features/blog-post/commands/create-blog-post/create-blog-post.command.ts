import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class CreateBlogPostCommand extends Command implements ICommand {
  readonly blogId: AggregateID;
  readonly userId: AggregateID;
  readonly title: string;
  readonly contents: Array<Record<string, any>>;
  readonly date: string;
  readonly location: string;
  readonly tagNames: string[];
  readonly fileUrls: string[];

  constructor(props: CommandProps<CreateBlogPostCommand>) {
    super(props);

    this.userId = props.userId;
    this.blogId = props.blogId;
    this.title = props.title;
    this.contents = props.contents;
    this.date = props.date;
    this.location = props.location;
    this.tagNames = props.tagNames;
    this.fileUrls = props.fileUrls;
  }
}
