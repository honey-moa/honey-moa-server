import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { ErrorMessage } from '@libs/types/type';

export const USER_ERROR_MESSAGE: ErrorMessage<typeof USER_ERROR_CODE> = {
  [USER_ERROR_CODE.ALREADY_CREATED_USER]: "You're already signed up.",
  [USER_ERROR_CODE.INVALID_EMAIL_VERIFY_TOKEN]:
    'An invalid email verification token.',
  [USER_ERROR_CODE.ALREADY_VERIFIED_EMAIL]: 'The email is already verified',
  [USER_ERROR_CODE.CANNOT_RESEND_VERIFICATION_EMAIL_AN_HOUR]:
    'Cannot resend verification email for at least 1 hour',
  [USER_ERROR_CODE.ALREADY_USED_EMAIL_VERIFY_TOKEN]:
    'The email verification token has already been used',
  [USER_ERROR_CODE.CANNOT_RESEND_PASSWORD_CHANGE_VERIFICATION_EMAIL_AN_HOUR]:
    'Cannot resend password change verification email for at least 1 hour',
  [USER_ERROR_CODE.INVALID_PASSWORD_CHANGE_VERIFY_TOKEN]:
    'An invalid password change verification token.',
  [USER_ERROR_CODE.ALREADY_USED_PASSWORD_CHANGE_VERIFY_TOKEN]:
    'The password change verification token has already been used',
  [USER_ERROR_CODE.EMAIL_NOT_VERIFIED]: 'The email is not verified',
} as const;
