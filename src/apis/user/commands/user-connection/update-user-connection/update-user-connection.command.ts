import { ICommand } from '@nestjs/cqrs';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

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
