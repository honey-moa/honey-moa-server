import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import type { ErrorMessage } from '@libs/types/type';

export const COMMON_ERROR_MESSAGE: ErrorMessage<typeof COMMON_ERROR_CODE> = {
  [COMMON_ERROR_CODE.SERVER_ERROR]:
    'Server error. Please contact server developer',
  [COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER]:
    'Invalid request parameter. Please check your request.',
  [COMMON_ERROR_CODE.API_NOT_FOUND]: 'Api not found. Please check your request',
  [COMMON_ERROR_CODE.INVALID_TOKEN]: 'This token is invalid.',
  [COMMON_ERROR_CODE.PERMISSION_DENIED]:
    "You don't have permission to access it.",
  [COMMON_ERROR_CODE.RESOURCE_NOT_FOUND]:
    "The resource you're trying to access doesn't exist.",
  [COMMON_ERROR_CODE.MISSING_UPDATE_FIELD]:
    'At least one update field must exist.',
  [COMMON_ERROR_CODE.INVALID_JSON_FORMAT]: 'Invalid JSON format',
} as const;
