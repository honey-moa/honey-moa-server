/**
 * @param { Object } GuardType 가드의 실행 방식에 대한 종류.
 * @param { string } GuardType.PUBLIC JWT 가드를 적용하지 않음. PUBLIC한 API에 적용.
 * @param { string } GuardType.REFRESH JWT 가드를 적용하지 않음. Refresh token을 사용하는 곳에 적용.
 * @param { string } GuardType.BASIC JWT 가드를 적용하지 않음. Basic token(로그인)을 사용하는 곳에 적용.
 * @param { string } GuardType.OPTIONAL 토큰이 없어도 접근이 가능하나, 각 상황에 따라 다른 동작을 해야 하는 API에 적용
 */
export const GuardType = {
  PUBLIC: 'public',
  REFRESH: 'refresh',
  BASIC: 'basic',
  OPTIONAL: 'optional',
} as const;

export const GUARD_TYPE_TOKEN = Symbol('GUARD_TYPE_TOKEN');
