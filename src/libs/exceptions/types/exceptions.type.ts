import { HttpException } from '@src/libs/exceptions/http.exception';

export type HttpError<E extends HttpException> = Pick<E, 'code' | 'errors'>;
