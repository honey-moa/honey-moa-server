import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { ErrorMessage } from '@src/libs/types/type';

export const USER_ERROR_MESSAGE: ErrorMessage<typeof USER_ERROR_CODE> = {
  [USER_ERROR_CODE.ALREADY_CREATED_USER]: "You're already signed up.",
} as const;
