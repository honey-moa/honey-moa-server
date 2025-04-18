import { CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class CreateChatMessageCommand implements ICommand {
  readonly userId: AggregateID;
  readonly roomId: AggregateID;
  readonly message: string;
  readonly blogPostUrl: string | null;

  constructor(props: CommandProps<CreateChatMessageCommand>) {
    this.userId = props.userId;
    this.roomId = props.roomId;
    this.message = props.message;
    this.blogPostUrl = props.blogPostUrl;
  }
}
