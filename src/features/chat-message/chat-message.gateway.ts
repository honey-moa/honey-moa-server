import { CreateChatMessageDto } from '@features/chat-message/dtos/socket/create-chat-message.dto';
import { EnterChatDto } from '@features/chat-message/dtos/socket/enter-chat.dto';
import { SocketWithUserDto } from '@features/chat-message/dtos/socket/socket-with-user.dto';
import { ExistsChatRoomQuery } from '@features/chat-room/queries/exists-chat-room.query';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { SocketCatchHttpExceptionFilter } from '@libs/exceptions/socket/filters/socket-catch-http.exception-filter';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { SocketJwtBearerAuthGuard } from '@libs/guards/providers/socket-jwt-bearer-auth.guard';
import { CustomValidationPipe } from '@libs/pipes/custom-validation.pipe';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipeOptions,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ValidationError } from 'class-validator';
import { Server, Socket } from 'socket.io';

const options: Omit<ValidationPipeOptions, 'exceptionFactory'> = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};

const exceptionFactory = (validationErrors: ValidationError[]) => {
  throw new HttpBadRequestException({
    code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
    errors: validationErrors.flatMap((validationError) => {
      return {
        property: validationError.property,
        value: validationError.value,
        reason: validationError.constraints
          ? Object.values(validationError.constraints)[0]
          : '',
      };
    }),
  });
};

const customValidationPipe = new CustomValidationPipe({
  ...options,
  exceptionFactory,
});

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatMessageGateway implements OnGatewayConnection {
  constructor(private readonly queryBus: QueryBus) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`);
  }

  @UsePipes(customValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @UseGuards(SocketJwtBearerAuthGuard)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = data;

    const query = new ExistsChatRoomQuery({ roomId });

    const existsRoom = await this.queryBus.execute<
      ExistsChatRoomQuery,
      boolean
    >(query);

    if (!existsRoom) {
      throw new WsException('Does not exist room');
    }

    socket.join(String(roomId));
  }

  @UsePipes(customValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @UseGuards(SocketJwtBearerAuthGuard)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() data: CreateChatMessageDto,
    @ConnectedSocket() socket: SocketWithUserDto,
  ) {
    /**
     * @todo
     * 1. room이 존재하는지 확인 (chatRoom 테이블에 roomId가 존재하는지 확인)
     * 2. 메시지를 전송하면 chatMessage 테이블에 메시지 저장.
     * (event를 발생시켜서 chatMessage 테이블에 저장하는 방식으로 개선하면 좋을듯.)
     */
    console.log(socket.user.sub);

    const { roomId, message } = data;

    const query = new ExistsChatRoomQuery({ roomId });

    const existsRoom = await this.queryBus.execute<
      ExistsChatRoomQuery,
      boolean
    >(query);

    if (!existsRoom) {
      throw new WsException('Does not exist room');
    }

    socket.to(String(roomId)).emit('receive_message', message);
    // this.server.in(String(data.chatId)).emit('receive_message', data.message);
  }
}
