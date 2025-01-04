import { UserVerifyTokenTypeUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserVerifyTokenProps {
  userId: AggregateID;
  token: string;
  type: UserVerifyTokenTypeUnion;
  expiresAt: Date;
  isUsed: boolean;
}

export interface CreateUserVerifyTokenProps {
  userId: AggregateID;
  type: UserVerifyTokenTypeUnion;
}
