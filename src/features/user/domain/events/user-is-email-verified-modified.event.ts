import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

export class UserIsEmailVerifiedUpdatedDomainEvent extends DomainEvent {
  readonly oldIsEmailVerified: boolean;
  readonly newIsEmailVerified: boolean;

  constructor(props: DomainEventProps<UserIsEmailVerifiedUpdatedDomainEvent>) {
    super(props);

    const { oldIsEmailVerified, newIsEmailVerified } = props;

    this.oldIsEmailVerified = oldIsEmailVerified;
    this.newIsEmailVerified = newIsEmailVerified;
  }
}
