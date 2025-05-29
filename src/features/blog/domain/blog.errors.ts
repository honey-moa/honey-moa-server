import { DomainException } from '@libs/ddd/domain-exception.base';
import { ERROR_CODE } from '@libs/exceptions/types/errors/error-code.constant';

export class CannotCreateBlogWithoutAcceptedConnectionError extends DomainException {
  readonly code = ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION;
}

export class BlogAlreadyExistsError extends DomainException {
  readonly code = ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG;
}

export class NotABlogMemberError extends DomainException {
  readonly code = ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION;
}

export class BlogValidationError extends DomainException {
  readonly code = ERROR_CODE.BLOG_VALIDATION_ERROR;

  constructor(message?: string) {
    super(message ?? 'Blog validation error');
  }
}
