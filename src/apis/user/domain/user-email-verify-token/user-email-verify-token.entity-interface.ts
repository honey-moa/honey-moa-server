import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserEmailVerifyTokenProps {
  userId: AggregateID;
  token: string;
  expiresAt: Date;
}

export interface CreateUserEmailVerifyTokenProps {
  userId: AggregateID;
}
