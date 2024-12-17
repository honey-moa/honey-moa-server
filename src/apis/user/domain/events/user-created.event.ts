import { DomainEvent, DomainEventProps } from '@libs/ddd/base-domain.event';

import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';

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
