import {
  DomainEvent,
  type DomainEventProps,
} from '@libs/ddd/base-domain.event';

import { UserLoginTypeUnion } from '@features/user/types/user.type';

export class UserCreatedDomainEvent extends DomainEvent {
  readonly email: string;
  readonly loginType: UserLoginTypeUnion;

  constructor(props: DomainEventProps<UserCreatedDomainEvent>) {
    super(props);

    const { email, loginType } = props;

    this.email = email;
    this.loginType = loginType;
  }
}
