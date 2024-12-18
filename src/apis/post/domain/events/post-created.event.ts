import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';
import { RequestContextService } from '@src/libs/application/context/app-request.context';

export class PostCreatedDomainEvent extends DomainEvent {
  readonly userId: bigint;

  readonly title: string;
  readonly body: string;

  constructor(props: DomainEventProps<PostCreatedDomainEvent>) {
    super({
      ...props,
      metadata: {
        correlationId: RequestContextService.getRequestId(),
        userId: props.userId,
        timestamp: new Date().getTime(),
      },
    });

    const { userId, title, body } = props;

    this.userId = userId;
    this.title = title;
    this.body = body;
  }
}
