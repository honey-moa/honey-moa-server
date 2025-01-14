import { BLOG_ERROR_CODE } from '@src/libs/exceptions/types/errors/blog/blog-error-code.constant';
import { ErrorMessage } from '@src/libs/types/type';

export const BLOG_ERROR_MESSAGE: ErrorMessage<typeof BLOG_ERROR_CODE> = {
  [BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG]: 'You already have a blog',
} as const;
