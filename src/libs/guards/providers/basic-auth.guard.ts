import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { UserLoginType } from '@src/apis/user/types/user.constant';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { AUTH_ERROR_CODE } from '@src/libs/exceptions/types/errors/auth/auth-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
      });
    }

    const token = this.extractTokenFromHeader(rawToken);

    const { email, password } = this.decodeBasicToken(token);

    const user = await this.authenticateUser({
      email,
      password,
    });

    req.user = user;

    return true;
  }

  private extractTokenFromHeader(header: string): string {
    const splitToken = header.split(' ');

    const prefix = 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const token = splitToken[1];

    return token;
  }

  private decodeBasicToken(base64String: string): {
    email: string;
    password: string;
  } {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  async authenticateUser(user: { email: string; password: string }) {
    /**
     * 1. 사용자가 존재하는지 확인 (email)
     * 2. 비밀번호가 맞는지 확인
     * 3. 모두 통과되면 찾은 사용자 정보 반환
     */
    const existingUser = await this.userRepository.findOneByEmailAndLoginType(
      user.email,
      UserLoginType.EMAIL,
    );

    if (!existingUser) {
      throw new HttpUnauthorizedException({
        code: AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
      });
    }

    /**
     * 파라미터
     *
     * 1) 입력된 비밀번호
     * 2) 기존 해시 (hash) -> 사용자 정보에 저장되어 있는 hash
     */
    const isValidPassword = await existingUser.comparePassword(user.password);

    if (!isValidPassword) {
      throw new HttpUnauthorizedException({
        code: AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
      });
    }

    return existingUser;
  }
}
