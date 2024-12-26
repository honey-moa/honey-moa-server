import { AggregateID } from '@src/libs/ddd/entity.base';

export interface EmailServicePort {
  sendVerificationEmail(
    email: string,
    userId: AggregateID,
    token: string,
  ): Promise<void>;
}
