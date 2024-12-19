import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

export class Guard {
  /**
   * Checks if value is empty. Accepts strings, numbers, booleans, objects and arrays.
   */
  static isEmpty(value: unknown): boolean {
    if (typeof value === 'number' || typeof value === 'boolean') {
      return false;
    }
    if (typeof value === 'undefined' || value === null) {
      return true;
    }
    if (value instanceof Date) {
      return false;
    }
    if (value instanceof Object && !Object.keys(value).length) {
      return true;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return true;
      }
      if (value.every((item) => Guard.isEmpty(item))) {
        return true;
      }
    }
    if (value === '') {
      return true;
    }

    return false;
  }

  /**
   * Checks length range of a provided number/string/array
   * If you don't give a max value, check if it's greater than or equal to min
   */
  static lengthIsBetween(
    value: number | string | Array<unknown>,
    min: number,
    max?: number,
  ): boolean {
    if (Guard.isEmpty(value)) {
      throw new HttpInternalServerErrorException({
        ctx: 'Cannot check length of a value. Provided value is empty',
        code: COMMON_ERROR_CODE.SERVER_ERROR,
      });
    }
    const valueLength =
      typeof value === 'number'
        ? Number(value).toString().length
        : value.length;
    if (valueLength >= min && max ? valueLength <= max : true) {
      return true;
    }
    return false;
  }

  static isObject = (value: unknown): value is Record<string, any> => {
    return Object.prototype.toString.call(value) !== '[object Object]';
  };

  static isIn(value: unknown, possibleValues: Readonly<unknown[]>) {
    return possibleValues.some((possibleValue) => possibleValue === value);
  }

  static isMatch(value: string, pattern: RegExp) {
    return pattern.test(value);
  }
}
