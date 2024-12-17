import { IdModel } from '@libs/db/id.model';
import { AggregateID } from '@libs/ddd/entity.base';

export interface BaseModelProps {
  id: AggregateID;
  createdAt: Date;
  updatedAt: Date;
}

export class BaseModel extends IdModel {
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: BaseModelProps) {
    super(props.id);

    const { createdAt, updatedAt } = props;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
