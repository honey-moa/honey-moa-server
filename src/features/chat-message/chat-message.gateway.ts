import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatMessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`);
  }

  @SubscribeMessage('enter_chat')
  enterChat(@MessageBody() chatId: number, @ConnectedSocket() socket: Socket) {
    socket.join(String(chatId));
  }

  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() data: { chatId: number; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(String(data.chatId)).emit('receive_message', data.message);
    // this.server.in(String(data.chatId)).emit('receive_message', data.message);
  }
}
