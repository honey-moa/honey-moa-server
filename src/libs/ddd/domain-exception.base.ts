import { ERROR_CODE } from '@libs/exceptions/types/errors/error-code.constant';
import { ValueOf } from '@libs/types/type';

export abstract class DomainException {
  abstract readonly code: ValueOf<typeof ERROR_CODE>;
}
