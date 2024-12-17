import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

export class UserLoginCredentialUpdatedDomainEvent extends DomainEvent {
  readonly password: string;

  constructor(props: DomainEventProps<UserLoginCredentialUpdatedDomainEvent>) {
    super(props);

    const { password } = props;

    this.password = password;
  }
}
