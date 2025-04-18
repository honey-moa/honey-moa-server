import { Command, type CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class DeleteBlogPostCommand extends Command implements ICommand {
  readonly blogId: AggregateID;
  readonly blogPostId: AggregateID;
  readonly userId: AggregateID;

  constructor(props: CommandProps<DeleteBlogPostCommand>) {
    super(props);

    this.blogId = props.blogId;
    this.blogPostId = props.blogPostId;
    this.userId = props.userId;
  }
}
