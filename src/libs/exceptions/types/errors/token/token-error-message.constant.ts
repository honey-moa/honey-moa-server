import { TOKEN_ERROR_CODE } from '@src/libs/exceptions/types/errors/token/token-error-code.constant';
import { ErrorMessage } from '@src/libs/types/type';

export const TOKEN_ERROR_MESSAGE: ErrorMessage<typeof TOKEN_ERROR_CODE> = {
  [TOKEN_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD]:
    'Wrong email or password. Please check again',
} as const;
