import { AggregateID } from '@libs/ddd/entity.base';
import { QueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindOneChatRoomByUserIdQuery extends QueryBase implements IQuery {
  readonly userId: AggregateID;

  constructor(props: FindOneChatRoomByUserIdQuery) {
    super();

    this.userId = props.userId;
  }
}
