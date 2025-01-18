import { ICommand } from '@nestjs/cqrs';
import { RequestContextService } from '@libs/application/context/app-request.context';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class CreatePostCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  readonly title: string;
  readonly body: string;

  constructor(props: CommandProps<CreatePostCommand>) {
    super({
      metadata: {
        correlationId: RequestContextService.getRequestId(),
        userId: props.userId,
        timestamp: new Date().getTime(),
      },
    });

    this.userId = props.userId;
    this.title = props.title;
    this.body = props.body;
  }
}
