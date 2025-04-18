import { AggregateID } from '@libs/ddd/entity.base';

export class IdModel {
  readonly id: AggregateID;

  constructor(id: AggregateID) {
    this.id = id;
  }
}
