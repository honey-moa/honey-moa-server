import { AUTH_ERROR_CODE } from '@libs/exceptions/types/errors/auth/auth-error-code.constant';
import { BLOG_ERROR_CODE } from '@libs/exceptions/types/errors/blog/blog-error-code.constant';
import { CHAT_ROOM_ERROR_CODE } from '@libs/exceptions/types/errors/chat-room/chat-room-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';

export const ERROR_CODE = {
  ...COMMON_ERROR_CODE,
  ...USER_ERROR_CODE,
  ...USER_CONNECTION_ERROR_CODE,
  ...BLOG_ERROR_CODE,
  ...CHAT_ROOM_ERROR_CODE,
  ...AUTH_ERROR_CODE,
} as const;
