import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class DeleteBlogPostCommentCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly blogPostId: AggregateID;
  readonly blogPostCommentId: AggregateID;

  constructor(props: CommandProps<DeleteBlogPostCommentCommand>) {
    super(props);

    this.userId = props.userId;
    this.blogPostId = props.blogPostId;
    this.blogPostCommentId = props.blogPostCommentId;
  }
}
