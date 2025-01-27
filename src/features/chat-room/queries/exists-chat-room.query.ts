import { AggregateID } from '@libs/ddd/entity.base';
import { IQuery } from '@nestjs/cqrs';

export class ExistsChatRoomQuery implements IQuery {
  readonly roomId: AggregateID;

  constructor(props: ExistsChatRoomQuery) {
    this.roomId = props.roomId;
  }
}
