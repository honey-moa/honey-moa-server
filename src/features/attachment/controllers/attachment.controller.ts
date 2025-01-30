import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { AggregateID } from '@libs/ddd/entity.base';
import { User } from '@libs/api/decorators/user.decorator';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { AttachmentMapper } from '@features/attachment/mappers/attachment.mapper';
import { ApiAttachment } from '@features/attachment/controllers/attachment.swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateAttachmentRequestBodyDto } from '@features/attachment/dtos/request/create-attachment.request-body-dto';
import { CreateAttachmentsCommand } from '@features/attachment/commands/create-user/create-attachment.command';

@ApiTags('Attachment')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class AttachmentController {
  constructor(
    private readonly mapper: AttachmentMapper,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiAttachment.Create({ summary: '파일 업로드 API' })
  @FormDataRequest()
  @Post(routesV1.attachment.create)
  async create(
    @User('sub') userId: AggregateID,
    @Body() requestDto: CreateAttachmentRequestBodyDto,
  ): Promise<void> {
    const command = new CreateAttachmentsCommand({
      files: requestDto.files.map((file) => ({
        userId,
        mimeType: file.mimeType,
        capacity: file.size,
        buffer: file.buffer,
      })),
    });

    await this.commandBus.execute(command);
  }
}
