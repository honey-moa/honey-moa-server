import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserPasswordUpdatedDomainEvent extends DomainEvent {
  readonly oldPassword: string;
  readonly newPassword: string;

  constructor(props: DomainEventProps<UserPasswordUpdatedDomainEvent>) {
    super(props);

    const { oldPassword, newPassword } = props;

    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }
}
