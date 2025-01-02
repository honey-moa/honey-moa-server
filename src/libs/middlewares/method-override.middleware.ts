import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

const requestMethodsArray = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'ALL',
  'OPTIONS',
  'HEAD',
  'SEARCH',
];

@Injectable()
export class MethodOverrideMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const fieldForOverrideMethod = '_method';

    const { body } = req;

    if (
      body[fieldForOverrideMethod] &&
      requestMethodsArray.includes(body[fieldForOverrideMethod])
    ) {
      req.method = body[fieldForOverrideMethod];
      delete req.body._method;
    }

    next();
  }
}
