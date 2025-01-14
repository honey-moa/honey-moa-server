import { CHAT_ROOM_ERROR_CODE } from '@src/libs/exceptions/types/errors/chat-room/chat-room-error-code.constant';
import { ErrorMessage } from '@src/libs/types/type';

export const CHAT_ROOM_ERROR_MESSAGE: ErrorMessage<
  typeof CHAT_ROOM_ERROR_CODE
> = {
  [CHAT_ROOM_ERROR_CODE.YOU_ALREADY_HAVE_A_CHAT_ROOM]:
    'You already have a chat room',
} as const;
