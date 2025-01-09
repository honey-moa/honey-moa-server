import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { SingleProperty } from '@src/libs/types/type';
import { Transform } from 'class-transformer';
import { isJSON, isEnum } from 'class-validator';

type AllowType = 'string' | 'number' | 'boolean' | 'bigint' | 'date';

type ValueType = string | number | boolean | bigint | Date;

/**
 * 1. key:value 포맷의 스트링을 배열로 받는다
 * 2. JSON.parse() (IsJSon으로 벨리데이션)
 * ex) orderBy = '["id:desc", "createdAt:asc"]'
 * 3. 각 배열의 요소를 돌면서 key, value를 :를 기준으로 파싱해서 obj로 만든다.
 * 3.1 각 요소중에 :가 없는 경우 에러를 던진다.
 * 3.2 각 요소중에 :가 여러개 있는 경우 에러를 던진다.
 * 3.3 각 요소중에 key 혹은 value가 없는 경우 에러를 던진다.
 * 3.4 파싱 과정에서 서버에서 허용한 key, value가 아닌 경우 에러를 던진다.(이건 데코레이터에서 option으로 받는다.)
 * 4. 파싱한 obj를 각 타입에 맞게 타입 변환한다.(이것도 데코레이터에서 옵션으로 받는다. 내 생각엔 {key: 'id', enum?: enum, type?: type })
 * 5. 타입을 만들어 준다.
 *
 * enum, type 둘 중의 하나 값만 허용
 */
export function ParseQueryByColonAndTransformToObject(
  option: {
    [key: string]: SingleProperty<{
      enum?: object;
      type?: AllowType;
    }> & {
      required?: boolean;
    };
  } = {},
): PropertyDecorator {
  return applyDecorators(
    ApiPropertyOptional({
      type: 'string',
      description:
        '허용 된 값에 맞게 key:value 포맷의 스트링을 담은 JSON 배열로 보내야 합니다.<br>' +
        '허용된 key 및 value: ' +
        Object.entries(option)
          .map(([key, value]) => {
            if (value?.enum) {
              return `${key}:${Object.values(value.enum).join(' || ')}`;
            }

            if (value?.type) {
              return `${key}:format이 ${value.type}인 string만 허용`;
            }

            return `${key}:모든 값 허용`;
          })
          .join(', ') +
        '<br>' +
        '만약 해당 쿼리를 사용한다면 필수 key값은 모두 포함해야 합니다.<br>' +
        '필수 key값: ' +
        `${
          Object.entries(option)
            .filter(([, value]) => value?.required)
            .map(([key]) => ` ${key}`)
            .join(', ') || '없음'
        }`,
      example:
        '[' +
        Object.entries(option)
          .map(([key, value]) => {
            if (value?.enum) {
              return `"${key}:${Object.values(value.enum)[0]}"`;
            }

            if (value?.type) {
              let example: string = '';

              if (value.type === 'number') {
                example = '123';
              }

              if (value.type === 'bigint') {
                example = '123';
              }

              if (value.type === 'boolean') {
                example = 'true';
              }

              if (value.type === 'date') {
                example = '2025-01-01';
              }

              if (value.type === 'string') {
                example = 'example';
              }

              return `"${key}:${example}"`;
            }

            return `${key}:모든 값 허용`;
          })
          .join(', ') +
        ']',
    }),

    Transform(({ value }) => {
      const isOptionEmpty: boolean = !Object.keys(option).length;

      if (!isJSON(value)) {
        throw new HttpBadRequestException({
          code: COMMON_ERROR_CODE.INVALID_JSON_FORMAT,
        });
      }

      const parsed: Array<string> = JSON.parse(value);

      const result = parsed.reduce<Record<string, ValueType>>((acc, val) => {
        const parsedKeyValue = val.split(':');

        if (parsedKeyValue.length !== 2) {
          throw new HttpBadRequestException({
            code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
            customMessage: 'Invalid format. The allowed format is key:value',
          });
        }

        const [key, value] = parsedKeyValue.map((el) => el.trim());

        if (!isOptionEmpty) {
          if (!option[key]) {
            throw new HttpBadRequestException({
              code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
              customMessage: `Invalid key: ${key}. Allowed keys are ${Object.keys(option).join(', ')}`,
            });
          }
          if (option[key].enum && !isEnum(value, option[key].enum)) {
            throw new HttpBadRequestException({
              code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
              customMessage: `Invalid value: ${value} for key: ${key}. Allowed values are ${Object.values(option[key].enum).join(', ')}`,
            });
          }
          if (option[key].type) {
            const transformedValue = validationTypeAndTransform(
              value,
              option[key].type,
              key,
            );

            acc[key] = transformedValue;

            return acc;
          }

          acc[key] = value;

          return acc;
        }

        acc[key] = value;

        return acc;
      }, {});

      const isRequiredKeyMissing = Object.keys(option)
        .filter((key) => option[key]?.required)
        .some((key) => !(key in result));

      if (isRequiredKeyMissing) {
        throw new HttpBadRequestException({
          code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
          customMessage: `Required key(s) are missing: ${Object.keys(option)
            .filter((key) => option[key]?.required)
            .join(', ')}`,
        });
      }

      return result;
    }),
  );
}

function validationTypeAndTransform(
  value: string,
  type: AllowType,
  key: string,
) {
  if (type === 'number') {
    if (!Number.isSafeInteger(Number(value))) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        customMessage: `Invalid value: ${value} for key: ${key}. Not integer or safe integer`,
      });
    }

    return Number(value);
  }

  if (type === 'bigint') {
    try {
      return BigInt(value);
    } catch {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        customMessage: `Invalid value: ${value} for key: ${key}. Not bigint`,
      });
    }
  }

  if (type === 'boolean') {
    if (
      value !== 'true' &&
      value !== 'false' &&
      value !== '1' &&
      value !== '0'
    ) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        customMessage: `Invalid value: ${value} for key: ${key}. Not boolean`,
      });
    }

    if (value === 'true' || value === '1') {
      return true;
    }

    if (value === 'false' || value === '0') {
      return false;
    }
  }

  if (type === 'date') {
    const timestamp = Date.parse(value);

    if (Number.isNaN(timestamp)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        customMessage: `Invalid value: ${value} for key: ${key}. Not date format`,
      });
    }

    return new Date(value);
  }

  if (type === 'string') {
    return value;
  }

  return value;
}
