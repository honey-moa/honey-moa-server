import { RequestContextService } from '@libs/application/context/app-request.context';
import { DomainEvent } from '@libs/ddd/base-domain.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Entity } from '@libs/ddd/entity.base';

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

  public async publishEvents(eventEmitter: EventEmitter2): Promise<void> {
    await Promise.all(
      this.domainEvents.map(async (event) => {
        console.log(
          `[${RequestContextService.getRequestId()}] "${
            event.constructor.name
          }" event published for aggregate ${this.constructor.name} : ${
            this.id
          }`,
        );

        return eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );

    this.clearEvents();
  }
}
