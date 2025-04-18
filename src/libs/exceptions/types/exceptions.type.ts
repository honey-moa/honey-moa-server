import { HttpException } from '@libs/exceptions/http.exception';

export type HttpError<E extends HttpException> = Pick<
  E,
  'code' | 'errors' | 'customMessage'
>;
