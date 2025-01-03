import { TOKEN_ERROR_MESSAGE } from '@src/libs/exceptions/types/errors/token/token-error-message.constant';
import { COMMON_ERROR_MESSAGE } from '@src/libs/exceptions/types/errors/common/common-error-message.constant';
import { USER_ERROR_MESSAGE } from '@src/libs/exceptions/types/errors/user/user-error-message.constant';

export const ERROR_MESSAGE = {
  ...COMMON_ERROR_MESSAGE,
  ...USER_ERROR_MESSAGE,
  ...TOKEN_ERROR_MESSAGE,
} as const;
