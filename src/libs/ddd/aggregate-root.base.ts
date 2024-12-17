import { RequestContextService } from '@libs/application/context/app-request.context';
import { DomainEvent } from '@libs/ddd/base-domain.event';
import { EventBus } from '@nestjs/cqrs';
import { Entity } from '@src/libs/ddd/entity.base';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public async publishEvents(eventBus: EventBus): Promise<void> {
    await Promise.all(
      this.domainEvents.map(async (event) => {
        console.log(
          `[${RequestContextService.getRequestId()}] "${
            event.constructor.name
          }" event published for aggregate ${this.constructor.name} : ${
            this.id
          }`,
        );

        return eventBus.publish(event);
      }),
    );

    this.clearEvents();
  }
}
