import { EnterChatDto } from '@features/chat-message/dtos/request/enter-chat.dto';
import { ExistsChatRoomQuery } from '@features/chat-room/queries/exists-chat-room.query';
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
import { Server, Socket } from 'socket.io';

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

  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = data;

    const query = new ExistsChatRoomQuery({ roomId });

    // room이 존재하는지 확인
    const existsRoom = await this.queryBus.execute<
      ExistsChatRoomQuery,
      boolean
    >(query);

    if (!existsRoom) {
      throw new WsException('Does not exist room');
    }

    socket.join(String(roomId));
  }

  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() data: { chatId: number; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    // 메시지를 전송하면 chatMessage 테이블에 메시지 저장.
    // event를 발생시켜서 chatMessage 테이블에 저장하는 방식으로 개선하면 좋을듯.

    socket.to(String(data.chatId)).emit('receive_message', data.message);
    // this.server.in(String(data.chatId)).emit('receive_message', data.message);
  }
}
