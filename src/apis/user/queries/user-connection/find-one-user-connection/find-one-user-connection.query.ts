import { IQuery } from '@nestjs/cqrs';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class FindOneUserConnectionQuery implements IQuery {
  readonly userId: AggregateID;
  readonly userConnectionId: AggregateID;

  constructor(props: FindOneUserConnectionQuery) {
    this.userId = props.userId;
    this.userConnectionId = props.userConnectionId;
  }
}
