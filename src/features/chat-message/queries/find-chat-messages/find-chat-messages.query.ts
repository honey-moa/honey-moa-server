import { IQuery } from '@nestjs/cqrs';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

export class FindChatMessagesQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly roomId: BigInt;

  constructor(props: PaginatedParams<FindChatMessagesQuery>) {
    super(props);

    const { roomId } = props;

    this.roomId = roomId;
  }
}
