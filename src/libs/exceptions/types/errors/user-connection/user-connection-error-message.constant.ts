import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { ErrorMessage } from '@libs/types/type';

export const USER_CONNECTION_ERROR_MESSAGE: ErrorMessage<
  typeof USER_CONNECTION_ERROR_CODE
> = {
  [USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION]:
    'You already have a connection',
  [USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION]:
    'You already sent a pending connection',
  [USER_CONNECTION_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION]:
    'The user you requested already have a connection',
  [USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED]:
    "The connection couldn't be created because the target's email was not verified.",
  [USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_MYSELF]:
    "You can't create a connection with yourself.",
  [USER_CONNECTION_ERROR_CODE.CAN_ONLY_UPDATE_PENDING_CONNECTION]:
    'You can only update a pending connection',
  [USER_CONNECTION_ERROR_CODE.CAN_ONLY_ACCEPT_CONNECTION_REQUEST_THAT_COME_TO_YOU]:
    'You can only accept a connection that comes to you',
  [USER_CONNECTION_ERROR_CODE.CAN_ONLY_REJECT_CONNECTION_REQUEST_THAT_COME_TO_YOU]:
    'You can only reject a connection that comes to you',
  [USER_CONNECTION_ERROR_CODE.CAN_ONLY_CANCEL_CONNECTION_REQUEST_THAT_YOU_SENT]:
    'You can only cancel a connection that you sent',
  [USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION]:
    "You don't have an accepted connection",
  [USER_CONNECTION_ERROR_CODE.CANNOT_DISCONNECT_CONNECTION_REQUEST_NOT_ACCEPTED]:
    'You cannot disconnect a connection that is not accepted',
  [USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION]:
    "You aren't part of a connection",
  [USER_CONNECTION_ERROR_CODE.ALREADY_HAVE_PENDING_CONNECTION_WITH_USER]:
    'You already have a pending connection with the user',
} as const;
