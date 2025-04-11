import type { AggregateID } from '@libs/ddd/entity.base';

export interface EmailServicePort {
  sendVerificationEmail(
    email: string,
    userId: AggregateID,
    token: string,
  ): Promise<void>;

  sendPasswordChangeVerificationEmail(
    userId: AggregateID,
    email: string,
    token: string,
    connectUrl: string,
  ): Promise<void>;
}
