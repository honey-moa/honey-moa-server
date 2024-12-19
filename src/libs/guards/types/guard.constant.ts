/**
 * @param { Object } GuardType 가드의 실행 방식에 대한 종류.
 * @param { string } GuardType.PUBLIC JWT 가드를 적용하지 않음. PUBLIC한 API에 적용.
 * @param { string } GuardType.BASIC JWT 가드를 적용하지 않음. Basic token(로그인)을 사용하는 곳에 적용.
 */
export const GuardType = {
  PUBLIC: 'public',
  BASIC: 'basic',
} as const;

export const GUARD_TYPE_TOKEN = Symbol('GUARD_TYPE_TOKEN');
