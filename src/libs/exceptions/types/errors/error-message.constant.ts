import { AUTH_ERROR_MESSAGE } from '@libs/exceptions/types/errors/auth/auth-error-message.constant';
import { BLOG_ERROR_MESSAGE } from '@libs/exceptions/types/errors/blog/blog-error-message.constant';
import { CHAT_ROOM_ERROR_MESSAGE } from '@libs/exceptions/types/errors/chat-room/chat-room-error-message.constant';
import { COMMON_ERROR_MESSAGE } from '@libs/exceptions/types/errors/common/common-error-message.constant';
import { USER_CONNECTION_ERROR_MESSAGE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-message.constant';
import { USER_ERROR_MESSAGE } from '@libs/exceptions/types/errors/user/user-error-message.constant';

export const ERROR_MESSAGE = {
  ...COMMON_ERROR_MESSAGE,
  ...USER_ERROR_MESSAGE,
  ...USER_CONNECTION_ERROR_MESSAGE,
  ...BLOG_ERROR_MESSAGE,
  ...CHAT_ROOM_ERROR_MESSAGE,
  ...AUTH_ERROR_MESSAGE,
} as const;
