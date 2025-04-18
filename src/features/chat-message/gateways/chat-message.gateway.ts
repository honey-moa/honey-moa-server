import { CreateChatMessageCommand } from '@features/chat-message/commands/create-message/create-chat-message.command';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { CreateChatMessageDto } from '@features/chat-message/dtos/socket/create-chat-message.dto';
import { EnterChatDto } from '@features/chat-message/dtos/socket/enter-chat.dto';
import { SocketWithUserDto } from '@features/chat-message/dtos/socket/socket-with-user.dto';
import { ChatMessageMapper } from '@features/chat-message/mappers/chat-message.mapper';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@libs/app-jwt/tokens/app-jwt.di-token';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { SocketCatchHttpExceptionFilter } from '@libs/exceptions/socket/filters/socket-catch-http.exception-filter';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { CustomValidationPipe } from '@libs/pipes/custom-validation.pipe';
import { isNil } from '@libs/utils/util';
import {
  Inject,
  type Logger,
  UseFilters,
  UsePipes,
  type ValidationPipeOptions,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ValidationError } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server } from 'socket.io';

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
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatMessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
    @Inject(APP_JWT_SERVICE_DI_TOKEN)
    private readonly appJwtService: AppJwtServicePort,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly commandBus: CommandBus,
    private readonly mapper: ChatMessageMapper,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: SocketWithUserDto) {
    const authProperty =
      socket.handshake.auth?.token || socket.handshake.headers.authorization;

    if (!authProperty || !authProperty.startsWith('Bearer ')) {
      this.logger.error(
        `[Socket] Connection rejected: missing token ${socket.id}`,
      );
      socket.disconnect();
      return;
    }

    const token = authProperty.split(' ')[1];

    try {
      const payload = await this.appJwtService.verifyToken(token);

      socket.user = { sub: payload.sub };
      this.logger.log(
        `[Socket] Connection accepted: ${socket.id}, userId: ${socket.user.sub}`,
      );
    } catch (error) {
      this.logger.error(
        `[Socket] Token verification failed for socket ${socket.id}: ${error}`,
      );
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: SocketWithUserDto) {
    this.logger.log(`[Socket] Disconnected: ${socket.id}`);
  }

  @UsePipes(customValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat_room')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: SocketWithUserDto,
  ) {
    const { roomId } = data;

    const chatRoom = await this.chatRoomRepository.findOneById(roomId);

    if (isNil(chatRoom)) {
      this.logger.error(
        `[Socket] enter_chat_room failed: Room ${roomId} does not exist`,
      );
      throw new WsException('Does not exist room');
    }

    socket.join(String(roomId));

    this.logger.log(`[Socket] User ${socket.user.sub} joined room ${roomId}`);

    return { statusMessage: 'Successfully joined room' };
  }

  @UsePipes(customValidationPipe)
  @UseFilters(SocketCatchHttpExceptionFilter)
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

    const { roomId, message, blogPostUrl } = data;
    const { sub: userId } = socket.user;

    this.logger.log(
      `[Socket] Received message from ${userId} in room ${roomId}: ${message}, ${blogPostUrl}`,
    );

    const command = new CreateChatMessageCommand({
      roomId: BigInt(roomId),
      userId: BigInt(userId),
      message,
      blogPostUrl,
    });

    this.logger.log(
      `[Socket] Sending message from ${userId} in room ${roomId}: ${message}, ${blogPostUrl}`,
    );

    const createdChatMessageEntity = await this.commandBus.execute<
      CreateChatMessageCommand,
      ChatMessageEntity
    >(command);

    const chatMessageResponseDto = this.mapper.toResponseDto(
      createdChatMessageEntity,
    );

    socket
      .to(String(roomId))
      .emit('receive_message', { ...chatMessageResponseDto });

    this.logger.log(
      `[Socket] Message emitted to room ${data.roomId}: ${JSON.stringify(chatMessageResponseDto)}`,
    );

    return {
      statusMessage: 'Successfully sent message',
      sentMessage: chatMessageResponseDto,
    };
  }
}
