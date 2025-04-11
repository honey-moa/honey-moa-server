import { HttpException } from '@libs/exceptions/http.exception';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    socket.emit('exception', {
      code: (exception.getResponse() as any).code,
      status: exception.getStatus(),
      message: exception.message,
    });
  }
}
