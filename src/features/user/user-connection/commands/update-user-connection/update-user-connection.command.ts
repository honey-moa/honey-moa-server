import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class UpdateUserConnectionCommand extends Command implements ICommand {
  readonly userConnectionId: AggregateID;
  readonly userId: AggregateID;
  readonly status: Exclude<
    UserConnectionStatusUnion,
    'PENDING' | 'DISCONNECTED'
  >;

  constructor(props: CommandProps<UpdateUserConnectionCommand>) {
    super(props);

    this.userConnectionId = props.userConnectionId;
    this.userId = props.userId;
    this.status = props.status;
  }
}
