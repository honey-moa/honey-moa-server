import { Socket } from 'socket.io';

export class SocketWithUserDto extends Socket {
  user: {
    sub: string;
  };
}
