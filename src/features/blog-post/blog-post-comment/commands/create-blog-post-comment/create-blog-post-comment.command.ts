import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class CreateBlogPostCommentCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly blogPostId: AggregateID;
  readonly content: string;

  constructor(props: CommandProps<CreateBlogPostCommentCommand>) {
    super(props);

    this.userId = props.userId;
    this.blogPostId = props.blogPostId;
    this.content = props.content;
  }
}
