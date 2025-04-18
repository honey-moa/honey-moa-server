import { AggregateID } from '@libs/ddd/entity.base';
import { IQuery } from '@nestjs/cqrs';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

export class FindChatMessagesQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly userId: AggregateID;
  readonly roomId: AggregateID;

  constructor(props: PaginatedParams<FindChatMessagesQuery>) {
    super(props);

    const { userId, roomId } = props;

    this.userId = userId;
    this.roomId = roomId;
  }
}
