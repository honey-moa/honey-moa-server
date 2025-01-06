import { AUTH_ERROR_CODE } from '@src/libs/exceptions/types/errors/auth/auth-error-code.constant';
import { ErrorMessage } from '@src/libs/types/type';

export const AUTH_ERROR_MESSAGE: ErrorMessage<typeof AUTH_ERROR_CODE> = {
  [AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD]:
    'Wrong email or password. Please check again',
} as const;
