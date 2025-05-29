import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogUpdatedDomainEvent extends DomainEvent {
  readonly name?: string;
  readonly description?: string;
  readonly dDayStartDate?: string;
  readonly userId: AggregateID;

  constructor(props: DomainEventProps<BlogUpdatedDomainEvent>) {
    super(props);

    const { name, description, dDayStartDate, userId } = props;

    this.name = name;
    this.description = description;
    this.dDayStartDate = dDayStartDate;
    this.userId = userId;
  }
}
