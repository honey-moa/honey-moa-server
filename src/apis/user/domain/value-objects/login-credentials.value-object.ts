import { Guard } from '@libs/guard';
import {
  USER_EMAIL_REGEXP,
  UserLoginType,
} from '@src/apis/user/types/user.constant';
import type { UserLoginTypeUnion } from '@src/apis/user/types/user.type';
import { ValueObject } from '@src/libs/ddd/value-object.base';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

export interface LoginCredentialProps {
  email: string;
  password: string;
  loginType: UserLoginTypeUnion;
}

export class LoginCredential extends ValueObject<LoginCredentialProps> {
  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get loginType(): string {
    return this.props.loginType;
  }

  protected validate(props: LoginCredentialProps): void {
    if (!Guard.isMatch(props.email, USER_EMAIL_REGEXP)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Not in email format',
      });
    }
    if (!Guard.lengthIsBetween(props.password, 8)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Passwords must be at least 8 characters long',
      });
    }
    if (!Guard.isIn(props.loginType, Object.values(UserLoginType))) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: `loginType must be ${Object.values(UserLoginType).join(', ')} only`,
      });
    }
  }
}
