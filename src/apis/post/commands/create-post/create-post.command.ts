import { ICommand } from '@nestjs/cqrs';
import { RequestContextService } from '@src/libs/application/context/app-request.context';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

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
