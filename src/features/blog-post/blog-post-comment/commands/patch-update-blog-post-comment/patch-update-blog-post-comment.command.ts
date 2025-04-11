import { Command, type CommandProps } from '@libs/ddd/command.base';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { ICommand } from '@nestjs/cqrs';

export class PatchUpdateBlogPostCommentCommand
  extends Command
  implements ICommand
{
  readonly userId: AggregateID;
  readonly blogPostId: AggregateID;
  readonly blogPostCommentId: AggregateID;
  readonly content?: string;

  constructor(props: CommandProps<PatchUpdateBlogPostCommentCommand>) {
    super(props);

    this.userId = props.userId;
    this.blogPostId = props.blogPostId;
    this.blogPostCommentId = props.blogPostCommentId;
    this.content = props.content;
  }
}
