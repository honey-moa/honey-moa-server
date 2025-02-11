import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { AggregateID } from '@libs/ddd/entity.base';
import { User } from '@libs/api/decorators/user.decorator';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { ApiAttachment } from '@features/attachment/controllers/attachment.swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateAttachmentRequestBodyDto } from '@features/attachment/dtos/request/create-attachment.request-body-dto';
import { CreateAttachmentsCommand } from '@features/attachment/commands/create-attachment/create-attachment.command';

@ApiTags('Attachment')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class AttachmentController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiAttachment.Create({ summary: '파일 업로드 API' })
  @FormDataRequest()
  @Post(routesV1.attachment.create)
  async create(
    @User('sub') userId: AggregateID,
    @Body() requestDto: CreateAttachmentRequestBodyDto,
  ): Promise<string[]> {
    const command = new CreateAttachmentsCommand({
      userId,
      files: requestDto.files.map((file) => ({
        mimeType: file.mimeType,
        capacity: file.size,
        buffer: file.buffer,
        uploadType: requestDto.uploadType,
      })),
    });

    const urls = await this.commandBus.execute<
      CreateAttachmentsCommand,
      string[]
    >(command);

    return urls;
  }
}
