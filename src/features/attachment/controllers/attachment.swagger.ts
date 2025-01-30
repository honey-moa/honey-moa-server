import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperator, ApiOperationOptionsWithSummary } from '@libs/types/type';
import { AttachmentController } from '@features/attachment/controllers/attachment.controller';
import { AttachmentResponseDto } from '@features/attachment/dtos/response/attachment.response-dto';

export const ApiAttachment: ApiOperator<keyof AttachmentController> = {
  Create: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ): MethodDecorator => {
    return applyDecorators(
      ApiOperation({
        ...apiOperationOptions,
      }),
      ApiBearerAuth('access-token'),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description:
          '현재는 정책 상 한번의 요청에 1개까지밖에 업로드 되지 않음.',
        schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      }),
      ApiCreatedResponse({
        description: '정상적으로 첨부파일 생성됨.',
        type: AttachmentResponseDto,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: 'Request parameter가 유효하지 않음',
          additionalErrors: {
            errors: [
              {
                property: 'connectUrl',
                value: 'http://localhost:3000.com',
                reason: 'connectUrl must be a URL address',
              },
              {
                value: 'jjb26com',
                property: 'email',
                reason: 'param internal the email must be a email format',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpNotFoundException.swaggerBuilder(HttpStatus.NOT_FOUND, [
        {
          code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
          description: '리소스를 찾을 수 없습니다.',
        },
      ]),
      HttpConflictException.swaggerBuilder(HttpStatus.CONFLICT, [
        {
          code: USER_ERROR_CODE.CANNOT_RESEND_PASSWORD_CHANGE_VERIFICATION_EMAIL_AN_HOUR,
          description:
            '비밀번호 변경 인증 이메일이 재전송된 지 1시간이 지나지 않음.',
        },
      ]),
    );
  },
};
