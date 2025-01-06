import { AUTH_ERROR_CODE } from '@src/libs/exceptions/types/errors/auth/auth-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';

export const ERROR_CODE = {
  // 0 ~ 999
  ...COMMON_ERROR_CODE,
  // 1000 ~ 1999
  ...USER_ERROR_CODE,
  // 2000 ~ 2999
  ...AUTH_ERROR_CODE,
} as const;
