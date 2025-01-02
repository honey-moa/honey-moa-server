import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserIsEmailVerifiedModify extends DomainEvent {
  readonly oldIsEmailVerified: boolean;
  readonly newIsEmailVerified: boolean;

  constructor(props: DomainEventProps<UserIsEmailVerifiedModify>) {
    super(props);

    const { oldIsEmailVerified, newIsEmailVerified } = props;

    this.oldIsEmailVerified = oldIsEmailVerified;
    this.newIsEmailVerified = newIsEmailVerified;
  }
}
