import { AggregateID } from '@libs/ddd/entity.base';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseResponseDto,
  type CreateBaseResponseDtoProps,
} from '@src/libs/api/dtos/response/base.response-dto';

export interface CreateChatMessageResponseDtoProps
  extends CreateBaseResponseDtoProps {
  roomId: AggregateID;
  senderId: AggregateID;
  message: string;
  blogPostUrl: string | null;
}

export class ChatMessageResponseDto
  extends BaseResponseDto
  implements Omit<CreateBaseResponseDtoProps, keyof CreateBaseResponseDtoProps>
{
  @ApiProperty({
    example: '668734709767935546',
    description: '채팅방 ID',
    type: 'string',
  })
  readonly roomId: AggregateID;

  @ApiProperty({
    example: '668734709767935546',
    description: '메시지를 보낸 유저 ID',
    type: 'string',
  })
  readonly senderId: AggregateID;

  @ApiProperty({
    example: '안녕하세요',
    description: '메시지',
  })
  readonly message: string;

  @ApiProperty({
    example: 'https://honeymoa.com/blog/2',
    description: '블로그 게시글 URL',
    nullable: true,
  })
  readonly blogPostUrl: string | null;

  constructor(create: CreateChatMessageResponseDtoProps) {
    super(create);

    const { roomId, senderId, message, blogPostUrl } = create;

    this.roomId = roomId;
    this.senderId = senderId;
    this.message = message;
    this.blogPostUrl = blogPostUrl;
  }
}
