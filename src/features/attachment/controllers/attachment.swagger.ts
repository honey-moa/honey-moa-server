import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { AttachmentController } from '@features/attachment/controllers/attachment.controller';
import { AttachmentUploadType } from '@features/attachment/types/attachment.constant';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { CustomValidationError } from '@libs/types/custom-validation-errors.type';
import { ApiOperationOptionsWithSummary, ApiOperator } from '@libs/types/type';

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
          '현재는 정책 상 한번의 요청에 1개까지밖에 업로드 되지 않음.<br>' +
          'Mime-Type은 image/png, image/jpeg, video/mp4, video/quicktime 타입만 허용됨.<br>' +
          '파일 크기는 10MB 까지만 허용됨.<br>' +
          'uploadType은 이미지 업로드라면 IMAGE, 첨부 파일 업로드라면 FILE',
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
            uploadType: {
              description:
                '파일 업로드 타입. 이미지 업로드라면 IMAGE, 첨부 파일 업로드라면 FILE',
              type: 'string',
              enum: Object.values(AttachmentUploadType),
            },
          },
        },
      }),
      ApiCreatedResponse({
        description:
          '정상적으로 첨부파일 생성됨. 업로드 된 파일들의 url이 response body에 반환됨.',
        type: String,
        isArray: true,
      }),
      HttpBadRequestException.swaggerBuilder(HttpStatus.BAD_REQUEST, [
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description:
            'Mime-Type은 image/png, image/jpeg, video/mp4, video/quicktime 타입만 허용됨.',
          additionalErrors: {
            errors: [
              {
                property: 'files',
                value: [
                  {
                    originalName: 'dd.prproj',
                    encoding: '7bit',
                    busBoyMimeType: 'application/octet-stream',
                    size: 414334,
                    fileType: {
                      ext: 'gz',
                      mime: 'application/gzip',
                    },
                  },
                ],
                reason:
                  'File must be of one of the types image/png, image/jpeg, video/mp4, video/quicktime',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '최대 파일 사이즈는 10MB 까지만 허용됨.',
          additionalErrors: {
            errors: [
              {
                property: 'files',
                value: [
                  {
                    originalName: 'dd.mov',
                    encoding: '7bit',
                    busBoyMimeType: 'video/quicktime',
                    size: 268903988,
                    fileType: {
                      ext: 'mov',
                      mime: 'video/quicktime',
                    },
                  },
                ],
                reason: 'Maximum file size is 10485760',
              },
            ],
            errorType: CustomValidationError,
          },
        },
        {
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          description: '최대 1개까지만 업로드 가능함.',
          additionalErrors: {
            errors: [
              {
                property: 'files',
                value: [
                  {
                    originalName: 'dd.mov',
                    encoding: '7bit',
                    busBoyMimeType: 'video/quicktime',
                    size: 268903988,
                    fileType: {
                      ext: 'mov',
                      mime: 'video/quicktime',
                    },
                  },
                  {
                    originalName: 'dd.mov',
                    encoding: '7bit',
                    busBoyMimeType: 'video/quicktime',
                    size: 268903988,
                    fileType: {
                      ext: 'mov',
                      mime: 'video/quicktime',
                    },
                  },
                ],
                reason: 'files must contain no more than 1 elements',
              },
            ],
            errorType: CustomValidationError,
          },
        },
      ]),
      HttpUnauthorizedException.swaggerBuilder(HttpStatus.UNAUTHORIZED, [
        {
          code: COMMON_ERROR_CODE.INVALID_TOKEN,
          description: '유효하지 않은 토큰으로 인해 발생하는 에러',
        },
      ]),
    );
  },
};
