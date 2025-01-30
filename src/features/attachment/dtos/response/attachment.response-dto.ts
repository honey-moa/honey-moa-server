import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty({
    description: '업로드 된 파일 url',
    format: 'uri',
  })
  url: string;

  constructor(props: AttachmentResponseDto) {
    this.url = props.url;
  }
}
